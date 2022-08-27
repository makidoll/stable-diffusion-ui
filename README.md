# Stable Diffusion UI

Really simple and intuitive interace for [Stable Diffusion](https://github.com/CompVis/stable-diffusion)

![example](https://raw.githubusercontent.com/makifoxgirl/stable-diffusion-ui/main/example.gif?1)

## Features

-   **Progress bar** when generating using iterations completed
-   **Loads images progressively** as it's generating the rest
-   **Saves all your images** in the sidebar
-   **Load any** of your previous images and **reproduce exactly**
    -   Then you can carefully **tweak the prompt**

## Installation (for Docker and Linux)

-   Install Docker and Nvidia Container Runtime

    https://docs.docker.com/engine/install/ubuntu/

    https://nvidia.github.io/nvidia-container-runtime/

    `apt-get install nvidia-container-runtime`

-   Copy `docker-compose.example.yml` to `docker-compose.yml` and make sure to link **sd-v1-4-full-ema.ckpt** and **optionally enable float16** to reduce VRAM

-   Finally, run:

    ```bash
    docker-compose build
    docker-compose up -d
    # see logs with
    docker-compose logs -f
    ```

-   Access at https://127.0.0.1:5000 or whichever IP your machine is available at
