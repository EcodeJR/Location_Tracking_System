const mongoose = require('mongoose');

const imageMetaSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  uploader: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  exif: {
    type: Object,
    default: {}
  },
  detectedFaces: [{
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1
    },
    _id: false
  }],
  gridFsId: { 
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: false
    },
    coordinates: {
      type: [Number],
      required: false,
      validate: {
        validator: function(v) {
          if (!v) return true; // Allow null/undefined
          return v.length === 2 && 
                 v[0] >= -180 && v[0] <= 180 && 
                 v[1] >= -90 && v[1] <= 90;
        },
        message: props => 
          `Invalid coordinates: ${props.value}. Longitude must be between -180 and 180, latitude between -90 and 90.`
      }
    }
  },
  // Additional metadata
  size: Number,
  contentType: String,
  width: Number,
  height: Number
}, {
  timestamps: true
});

imageMetaSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('ImageMeta', imageMetaSchema);