FROM node:lts AS frontend

WORKDIR /app/

COPY frontend /app/frontend/

RUN cd /app/frontend/ && yarn && yarn build

# ---

# from pytorch website use cuda 11.6.2 https://pytorch.org
# https://gitlab.com/nvidia/container-images/cuda/blob/master/doc/supported-tags.md

FROM nvidia/cuda:11.6.2-cudnn8-runtime-ubuntu20.04

WORKDIR /app/
RUN apt-get update -y && apt-get install -y python3-pip && \
pip install torch --extra-index-url https://download.pytorch.org/whl/cu116

COPY requirements.txt /app/
# wont redownload torch because we're not doing --upgrade
RUN pip install -r requirements.txt

COPY server.py /app/
COPY --from=frontend /app/frontend/dist/ /app/frontend/dist/

CMD python3 server.py
