import base64
import datetime
import math
import os
import random
from io import BytesIO
from pathlib import Path
from time import sleep
from urllib import request
from threading import Lock

from flask import (
    Flask, Response, jsonify, request, send_file, send_from_directory,
    stream_with_context
)
from PIL import Image, ImageDraw
from tinydb import TinyDB
from waitress import serve

# DEV=1 python3 server.py
make_test_images = os.environ.get("DEV") == "1"
if make_test_images:
	print("IN DEV=1 MODE, WILL MAKE TEST IMAGES INSTEAD")

if make_test_images:

	def fakeImage(i, prompt):
		img = Image.new(
		    "RGB", (256, 256),
		    color=(
		        random.randrange(0, 128),
		        random.randrange(0, 128),
		        random.randrange(0, 128),
		    )
		)
		imgDraw = ImageDraw.Draw(img)
		imgDraw.text((10, 10), prompt, fill=(255, 255, 255))
		imgDraw.text((10, 25), "output " + str(i), fill=(255, 255, 255))
		return img
else:
	import generate_image

# paths, server and database

data_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../data")
frontend_path = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), "../frontend/dist"
)

app = Flask(__name__, static_folder=frontend_path, static_url_path="/")

Path(data_path).mkdir(parents=True, exist_ok=True)

db = TinyDB(os.path.join(data_path, "db.json"))

# functions and preloading

def make_preview(images, id: int, width: int, height: int, variations: int):
	preview_height = 64
	preview_width_of_one = math.floor(preview_height * float(width / height))
	preview_image = Image.new(
	    "RGB", (preview_width_of_one * variations, preview_height)
	)
	for i in range(0, len(images)):
		image = images[i].resize(
		    (preview_width_of_one, preview_height),
		    resample=Image.Resampling.LANCZOS
		)
		preview_image.paste(image, (preview_width_of_one * i, 0))

	preview_filename = "id" + str(id) + "_preview.jpg"
	preview_save_path = os.path.join(data_path, preview_filename)
	preview_image.save(preview_save_path, "JPEG", quality=70)

# generate previews that weren't made before i removed the api call

preview_id = 0
for result in db.table("generated").all():
	preview_id += 1
	id = preview_id

	preview_filename = "id" + str(id) + "_preview.jpg"
	preview_save_path = os.path.join(data_path, preview_filename)

	if not os.path.exists(preview_save_path):
		width = result.get("width", 512)
		height = result.get("height", 512)
		variations = result.get("variations", 3)

		images = []
		for i in range(0, variations):
			images.append(
			    Image.open(
			        os.path.join(
			            data_path, "id" + str(id) + "_v" + str(i) + ".png"
			        )
			    ),
			)

		make_preview(images, id, width, height, variations)

# web server api

generating_lock = Lock()

# step_previews = {}

# @app.route("/api/preview/<id>/<variation>/<step>")
# def preview(id, variation, step):
# 	id = int(id)
# 	variation = int(variation)
# 	step = int(step)

# 	image = generate_image.x_to_image(step_previews[id][variation][step])

# 	image_io = BytesIO()
# 	image.save(image_io, "png")
# 	image_io.seek(0)

# 	return send_file(image_io, mimetype="image/png")

@app.route("/api/generate", methods=["POST"])
def generate():
	global generating_lock
	if generating_lock.locked():
		return jsonify({"error": "Busy generating another"}), 400

	@stream_with_context
	def generate_stream():
		global generating_lock
		with generating_lock:
			try:
				variations = 3

				prompt = request.json["prompt"]
				seed = int(request.json["seed"])
				inference_steps = int(request.json["inferenceSteps"])
				guidance_scale = float(request.json["guidanceScale"])
				width = int(request.json["width"])
				height = int(request.json["height"])
				sampler = request.json["sampler"]

				if inference_steps > 150:
					yield jsonify(
					    {
					        "error":
					            "Please don't do more than 150 inference steps"
					    }
					).data
					return

				id = len(db.table("generated").all()) + 1

				yield jsonify(
				    {
				        "id": id,
				        "completed": 0,
				        "variations": variations,
				        "prompt": prompt,
				        "percentage": 0
				    }
				).data

				images = []
				# step_previews[id] = {}

				if make_test_images:
					if seed == -1:
						seed = random.randint(0, 2**32 - 1)

					for i in range(0, variations):
						sleep(1)

						image = fakeImage(i, prompt)
						filename = "id" + str(id) + "_v" + str(i) + ".png"
						save_path = os.path.join(data_path, filename)
						image.save(save_path)
						images.append(image)

						yield jsonify(
						    {
						        "completed": i + 1,
						        "percentage": ((i + 1) / variations) * 100
						    }
						).data
				else:
					if seed == -1:
						seed = generate_image.generate_seed()

					for i in range(0, variations):
						# step_previews[id][i] = {}

						def yield_on_step(step):
							# step_previews[id][i][step] = x
							return jsonify(
							    {
							        # "step": step,
							        "percentage":
							            (
							                (i / variations) + (
							                    step / inference_steps /
							                    variations
							                )
							            ) * 100
							    }
							).data

						result = yield from generate_image.generate_image(
						    prompt=prompt,
						    seed=seed + i,
						    width=width,
						    height=height,
						    ddim_steps=inference_steps,
						    cfg_scale=guidance_scale,
						    yield_on_step=yield_on_step,
						    check_safety=False,
						    sampler=sampler
						)

						image = result["image"]
						warning = result["prompt_length_warning"]
						# has_nsfw_concept = result["has_nsfw_concept"]

						filename = "id" + str(id) + "_v" + str(i) + ".png"
						save_path = os.path.join(data_path, filename)
						image.save(save_path)
						images.append(image)

						yield jsonify(
						    {
						        "completed": i + 1,
						        "percentage": ((i + 1) / variations) * 100
						    }
						).data

				data = {
				    "prompt": prompt,
				    "seed": seed,
				    "inferenceSteps": inference_steps,
				    "guidanceScale": guidance_scale,
				    "width": width,
				    "height": height,
				    "sampler": sampler,
				    # other
				    "variations": variations,
				    "created": datetime.datetime.utcnow().isoformat() + "Z"
				}

				make_preview(images, id, width, height, variations)

				# should be the same as id but this is more correct
				id = db.table("generated").insert(data)

				# add to response
				data["finished"] = True
				data["warning"] = warning
				data["id"] = id

				yield jsonify(data).data

			except Exception as e:
				print(repr(e))
				yield jsonify(
				    {
				        "error": "Something went wrong, try again soon"
				    }
				).data
				raise e

	return Response(generate_stream())

@app.route("/api/generate/oneoff", methods=["POST"])
def generate_oneoff():
	global generating_lock
	if generating_lock.locked():
		return jsonify({"error": "Busy generating another"}), 400

	@stream_with_context
	def generate_oneoff_stream():
		global generating_lock
		with generating_lock:
			variations = 3

			try:
				prompt = request.json["prompt"]

				images = []
				unsafe = []

				if make_test_images:

					for i in range(0, variations):
						sleep(1)

						images.append(fakeImage(i, prompt))

				else:
					seed = generate_image.generate_seed()

					for i in range(0, variations):

						result = yield from generate_image.generate_image(
						    prompt=prompt,
						    seed=seed + i,
						    width=512,
						    height=512,
						    ddim_steps=50,
						    cfg_scale=7.5,
						    check_safety=True,
						    sampler="k_lms"
						)

						images.append(result["image"])
						unsafe.append(result["has_nsfw_concept"])

				images_as_base64 = []

				for image in images:
					image_io = BytesIO()
					image.save(image_io, "PNG")
					image_io.seek(0)
					images_as_base64.append(
					    "data:image/png;base64," +
					    base64.b64encode(image_io.read()).decode("ascii")
					)

				data = {"images": images_as_base64, "unsafe": unsafe}

				yield jsonify(data).data
			except Exception as e:
				print(repr(e))
				yield jsonify(
				    {
				        "error": "Something went wrong, try again soon"
				    }
				).data

	return Response(generate_oneoff_stream())

@app.route("/api/results", methods=["GET"])
def results():
	results = db.table("generated").all()
	for i in range(0, len(results)):
		results[i]["id"] = i + 1
	results.reverse()
	return jsonify(results)

@app.route("/api/image/<path:path>")
def image(path):
	return send_from_directory(data_path, path)

# web server frontend

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def catch_all(path):
	return app.send_static_file("index.html")

# dont run flask cli

if __name__ == "__main__":
	print("Server running at http://127.0.0.1:5000")
	serve(app, port=5000, host="0.0.0.0", threads=16)
