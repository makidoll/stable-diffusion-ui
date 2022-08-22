# Stable Diffusion UI

Really simple and intuitive interace for [Stable Diffusion](https://github.com/CompVis/stable-diffusion)

![example](https://user-images.githubusercontent.com/8362329/186038527-c4802c98-5793-4975-9814-981a1ca616d9.jpg)

## Features

- **Progress bar** when generating
- **Saves all your images** in the sidebar
- **Load any** of your previous images and **reproduce exactly**
  - Then you can carefully **tweak the prompt**

## Installation (for Docker and Linux)

- Install Docker and Nvidia Container Runtime

  https://docs.docker.com/engine/install/ubuntu/
  
  https://nvidia.github.io/nvidia-container-runtime/

  `apt-get install nvidia-container-runtime`

- Copy `docker-compose.example.yml` to `docker-compose.yml` and configure it with your Hugging Face  token

- In `server.py` you can find:

  ```py
  # revision="fp16",
  torch_dtype=torch.float32,
  ```
  
  Either leave as is for `float32` or uncomment and update for `float16` half precision
  
- In `frontend/src/consts.ts` you'll find:

  ```js
  // with 50 steps at 512 x 512
  // its 10s on my 3060 ti
  etaPerImage: 10, // seconds
  ```
  
  The `etaPerImage` is set to how long it takes to generate one image at 50 steps at 512 x 512. Update this as best as you can to get a more accurate progress bar.
  
- Finally, run:

  ```bash
  docker-compose build
  docker-compose up -d
  # see logs with
  docker-compose logs -f
  ```
  
- Access at https://127.0.0.1:5000 or whichever IP your machine is available at
