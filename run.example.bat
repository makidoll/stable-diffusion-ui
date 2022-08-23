@echo off

@rem agree to stable diffusion license first
@rem https://huggingface.co/CompVis/stable-diffusion-v1-4
@rem then get a token from here
@rem https://huggingface.co/settings/tokens
set HUGGINGFACE_AUTH_TOKEN=

@rem if you want to use float16 to reduce vram, uncomment
@rem set USE_FLOAT16=1

python server.py