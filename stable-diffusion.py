import datetime
import os
import random
import sys
from pathlib import Path
from urllib import request

from flask import Flask, jsonify, request
from PIL import Image, ImageDraw
from tinydb import TinyDB

app = Flask(__name__)

dataPath = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")

Path(dataPath).mkdir(parents=True, exist_ok=True)

db = TinyDB(os.path.join(dataPath, "db.json"))

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

# web server

@app.route("/api/generate", methods=["POST"])
def generate():
	prompt = request.json["prompt"]
	seed = request.json["seed"]

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
		savePath = os.path.join(dataPath, filename)
		images[v].save(savePath)

	return jsonify(data)

@app.route("/api/results", methods=["GET"])
def results():
	results = db.table("generated").all()
	for i in range(0, len(results)):
		results[i]["id"] = i + 1
	results.reverse()
	return jsonify(results)

if __name__ == "__main__":
	app.run(debug=False, port=5000)
