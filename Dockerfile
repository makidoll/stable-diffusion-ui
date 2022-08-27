FROM node:lts AS frontend

WORKDIR /app/

COPY frontend /app/frontend/

RUN cd /app/frontend/ && yarn && yarn build

# ---

# from pytorch website use cuda 11.6.2 https://pytorch.org
# https://gitlab.com/nvidia/container-images/cuda/blob/master/doc/supported-tags.md

FROM nvidia/cuda:11.6.2-cudnn8-runtime-ubuntu20.04

WORKDIR /app/
RUN apt-get update -y && apt-get install -y python3-pip git && \
pip install torch --extra-index-url https://download.pytorch.org/whl/cu116

# wont redownload torch because we're not doing --upgrade
COPY server/requirements.txt /app/server/requirements.txt
RUN \
pip install -e git+https://github.com/CompVis/stable-diffusion.git@main#egg=latent-diffusion && \
pip install -e git+https://github.com/CompVis/taming-transformers.git@master#egg=taming-transformers && \
pip install -r server/requirements.txt

COPY server /app/server/
COPY --from=frontend /app/frontend/dist/ /app/frontend/dist/

CMD python3 server/server.py
