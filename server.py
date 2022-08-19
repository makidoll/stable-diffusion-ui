import datetime
import os
import random
from io import BytesIO
from pathlib import Path
from urllib import request

from flask import Flask, jsonify, request, send_file, send_from_directory
from PIL import Image, ImageDraw
from tinydb import TinyDB

data_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
frontend_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "dist")

app = Flask(__name__, static_folder=frontend_path, static_url_path="/")

Path(data_path).mkdir(parents=True, exist_ok=True)

db = TinyDB(os.path.join(data_path, "db.json"))

# --

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

# web server api

@app.route("/api/generate", methods=["POST"])
def generate():
	prompt = request.json["prompt"]
	seed = int(request.json["seed"])

	if seed == -1:
		seed = random.randint(0, 9007199254740991)

	images = [
	    fakeImage(1, prompt),
	    fakeImage(2, prompt),
	    fakeImage(3, prompt),
	    fakeImage(4, prompt),
	    fakeImage(5, prompt),
	    fakeImage(6, prompt),
	]

	data = {
	    "prompt": prompt,
	    "seed": seed,
	    "variations": len(images),
	    "created": datetime.datetime.utcnow().isoformat() + "Z"
	}

	id = db.table("generated").insert(data)
	data["id"] = id

	for v in range(0, len(images)):
		filename = "id" + str(id) + "_v" + str(v) + ".png"
		save_path = os.path.join(data_path, filename)
		images[v].save(save_path)

	return jsonify(data)

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

@app.route("/api/preview/<path:id>")
def preview(id):
	size = 64
	images = [
	    Image.open(os.path.join(data_path, "id" + id + "_v0.png")),
	    Image.open(os.path.join(data_path, "id" + id + "_v1.png")),
	    Image.open(os.path.join(data_path, "id" + id + "_v2.png")),
	    Image.open(os.path.join(data_path, "id" + id + "_v3.png")),
	    Image.open(os.path.join(data_path, "id" + id + "_v4.png")),
	    Image.open(os.path.join(data_path, "id" + id + "_v5.png")),
	]

	final_image = Image.new("RGB", (size * len(images), size))
	for i in range(0, len(images)):
		image = images[i].resize(
		    (size, size), resample=Image.Resampling.LANCZOS
		)
		final_image.paste(image, (size * i, 0))

	final_image_io = BytesIO()
	final_image.save(final_image_io, "JPEG", quality=70)
	final_image_io.seek(0)
	return send_file(final_image_io, mimetype="image/png")

	return final_image

# web server frontend

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def catch_all(path):
	return app.send_static_file("index.html")

# dont run flask cli

if __name__ == "__main__":
	app.run(debug=False, port=5000, host="0.0.0.0")
