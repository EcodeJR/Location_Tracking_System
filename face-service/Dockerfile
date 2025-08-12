FROM python:3.10-slim

RUN apt-get update && apt-get install -y build-essential libboost-all-dev cmake libopenblas-dev liblapack-dev libatlas-base-dev libgtk2.0-dev libjpeg-dev libavcodec-dev libavformat-dev libswscale-dev pkg-config wget git

WORKDIR /app
COPY . /app
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

EXPOSE 5001
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5001", "app:app"]