const ImageMeta = require('../models/ImageMeta');
const User = require('../models/User');
const { extractExif } = require('../services/exifService');
const { recognizeFace } = require('../services/faceService');
const { getGFS } = require('../config/gridfs');

// Upload route uses multer-gridfs-storage; file available as req.file
async function uploadImage(req, res, next) {
  try {
    const file = req.file; // gridfs stored
    if (!file) return res.status(400).json({ message: 'No file uploaded' });

    // read file from GridFS to get buffer for EXIF (GridFS read stream)
    const conn = mongoose.connection;
    const bucket = new mongoose.mongo.GridFSBucket(conn.db, { bucketName: 'uploads' });

    const downloadStream = bucket.openDownloadStream(file.id);
    const chunks = [];
    downloadStream.on('data', (chunk) => chunks.push(chunk));

    downloadStream.on('error', (err) => {
      console.error('GridFS download error', err);
    });

    downloadStream.on('end', async () => {
      const buffer = Buffer.concat(chunks);
      const exif = extractExif(buffer);

      // If EXIF has GPS, set location
      let location = { type: 'Point', coordinates: [0, 0] };
      if (exif.GPSLatitude && exif.GPSLongitude) {
        const lat = gpsToDecimal(exif.GPSLatitude, exif.GPSLatitudeRef);
        const lon = gpsToDecimal(exif.GPSLongitude, exif.GPSLongitudeRef);
        location.coordinates = [lon, lat];
      }

      // Save ImageMeta
      const meta = await ImageMeta.create({
        filename: file.filename,
        uploadDate: file.uploadDate,
        uploader: req.user.id,
        exif,
        gridFsId: file.id,
        location
      });

      // Call face recognition service (optional)
      const faces = await recognizeFace(file.id);
      meta.detectedFaces = faces;
      await meta.save();

      // Update lastSeen for any matched users
      for (const f of faces) {
        if (f.userId) {
          await User.findByIdAndUpdate(f.userId, {
            lastSeen: {
              at: new Date(),
              location,
              imageId: file.id
            }
          });
        }
      }

      res.json({ message: 'Uploaded', meta });
    });
  } catch (err) {
    next(err);
  }
}

function gpsToDecimal(gpsArray, ref) {
  // gpsArray is like [deg, min, sec]. exif-parser returns rationals sometimes; simplify
  if (!gpsArray) return 0;
  const toNum = (v) => (typeof v === 'number' ? v : v.n / v.d);
  const deg = toNum(gpsArray[0]) || 0;
  const min = toNum(gpsArray[1]) || 0;
  const sec = toNum(gpsArray[2]) || 0;
  let dec = deg + min / 60 + sec / 3600;
  if (ref === 'S' || ref === 'W') dec = -dec;
  return dec;
}

// Stream image by filename or id
async function getImage(req, res, next) {
  try {
    const fileId = req.params.id;
    const conn = mongoose.connection;
    const bucket = new mongoose.mongo.GridFSBucket(conn.db, { bucketName: 'uploads' });
    const _id = new mongoose.Types.ObjectId(fileId);
    const downloadStream = bucket.openDownloadStream(_id);
    res.set('Content-Type', 'image/jpeg');
    downloadStream.pipe(res);
  } catch (err) {
    next(err);
  }
}

module.exports = { uploadImage, getImage };