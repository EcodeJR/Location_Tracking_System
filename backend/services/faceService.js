// Placeholder to call an external facial-recognition microservice (Python/Flask)
const axios = require('axios');

const FACE_SERVICE_URL = process.env.FACE_SERVICE_URL; // e.g. http://localhost:5001/recognize

async function recognizeFace(gridFsFileId) {
  // You can implement by streaming the file to the face service, or have the service fetch it.
  try {
    const res = await axios.post(FACE_SERVICE_URL, { fileId: gridFsFileId });
    return res.data; // expected: [{ userId, confidence }, ...]
  } catch (err) {
    console.error('Face service error', err.message);
    return [];
  }
}

module.exports = { recognizeFace };