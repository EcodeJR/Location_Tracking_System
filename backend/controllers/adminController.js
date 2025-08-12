const ImageMeta = require('../models/ImageMeta');
const User = require('../models/User');

async function listUploads(req, res, next) {
  try {
    const uploads = await ImageMeta.find().populate('uploader detectedFaces.user').sort({ uploadDate: -1 }).limit(100);
    res.json(uploads);
  } catch (err) {
    next(err);
  }
}

module.exports = { listUploads };