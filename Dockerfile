FROM node:lts AS frontend
WORKDIR /app/
COPY . /app/
RUN yarn && yarn build

FROM nvidia/cuda:11.6.2-cudnn8-runtime-ubuntu20.04
WORKDIR /app/
RUN apt-get update -y && apt-get install -y python3-pip
COPY server.py requirements.txt /app/
RUN pip install -r requirements.txt
COPY --from=frontend /app/dist/ /app/dist/
CMD python3 server.py
