# LastSeen Backend

Backend for a user "last seen" tracking app.

## Setup

1. Copy `.env.example` to `.env` and provide MONGO_URI and JWT_SECRET.
2. `npm install`
3. `npm run dev`

## Notes

- Images are stored in MongoDB GridFS under the `uploads.files` bucket.
- Facial recognition is implemented as a separate microservice — see FACE_SERVICE_URL.
- EXIF parsing uses `exif-parser`.