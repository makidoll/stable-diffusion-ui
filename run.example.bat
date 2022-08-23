@echo off

@rem agree to stable diffusion license first
@rem https://huggingface.co/CompVis/stable-diffusion-v1-4
@rem then get a token from here
@rem https://huggingface.co/settings/tokens
set HUGGINGFACE_AUTH_TOKEN=

@rem with 50 steps at 512 x 512
@rem its 10s on my 3060 ti (linux)
@rem its 6s on my 3080 ti (windows)
set ETA_PER_IMAGE=6

python server.py