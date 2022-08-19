FROM npm:lts AS frontend
WORKDIR /app/
COPY . ./
RUN yarn build

FROM nvidia/cuda:11.6.2-cudnn8-runtime-ubuntu20.04
WORKDIR /app
COPY server.py requirements.txt ./
COPY --from=frontend /app/dist ./
RUN pip install -r requirements.txt
CMD python server.py