const mongoose = require('mongoose');

const imageMetaSchema = new mongoose.Schema({
  filename: String,
  uploadDate: Date,
  uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  exif: Object,
  detectedFaces: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      confidence: Number
    }
  ],
  gridFsId: { type: mongoose.Schema.Types.ObjectId },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }
  }
});

imageMetaSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('ImageMeta', imageMetaSchema);