# Face Recognition Microservice

1. Copy `.env.example` to `.env` and set MONGO_URI and other env vars.
2. Create virtual env: `python -m venv venv` and activate it.
3. `pip install -r requirements.txt`
4. `python app.py` or use Docker.

Endpoints:
- GET / -> health
- POST /recognize -> { fileId } or form-data (image)
- POST /enroll -> form-data (userId, image) or JSON { userId, fileId }

Response for /recognize: { matches: [{ userId, confidence }], faces: N }
