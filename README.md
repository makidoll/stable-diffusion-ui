# Stable Diffusion UI

Really simple and intuitive interace for [Stable Diffusion](https://github.com/CompVis/stable-diffusion)

![example](https://user-images.githubusercontent.com/8362329/186038527-c4802c98-5793-4975-9814-981a1ca616d9.jpg)

## Features

-   **Progress bar** when generating
-   **Loads images progressively** as it's still generating
-   **Saves all your images** in the sidebar
-   **Load any** of your previous images and **reproduce exactly**
    -   Then you can carefully **tweak the prompt**

## Installation (for Docker and Linux)

-   Install Docker and Nvidia Container Runtime

    https://docs.docker.com/engine/install/ubuntu/

    https://nvidia.github.io/nvidia-container-runtime/

    `apt-get install nvidia-container-runtime`

-   Copy `docker-compose.example.yml` to `docker-compose.yml` and configure it with your **Hugging Face token** and your **ETA for the progress bar** (will automate hopefully)

-   In `server.py` you can find:

    ```py
    # revision="fp16",
    torch_dtype=torch.float32,
    ```

    Either leave as is for `float32` or uncomment and update for `float16` half precision

-   Finally, run:

    ```bash
    docker-compose build
    docker-compose up -d
    # see logs with
    docker-compose logs -f
    ```

-   Access at https://127.0.0.1:5000 or whichever IP your machine is available at