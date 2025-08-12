const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now },
  lastSeen: {
    at: Date,
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }
    },
    imageId: { type: mongoose.Schema.Types.ObjectId, ref: 'fs.files' }
  }
});

userSchema.index({ 'lastSeen.location': '2dsphere' });

module.exports = mongoose.model('User', userSchema);