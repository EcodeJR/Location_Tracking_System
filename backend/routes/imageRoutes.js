const express = require('express');
const router = express.Router();
const { 
  uploadImage, 
  getImage, 
  getMyImages, 
  getUserImagesWithLocations,
  deleteImage
} = require('../controllers/imageController');
const auth = require('../middleware/auth');
const { upload } = require('../services/storage');

// Image routes - Specific routes first to prevent conflicts
router.post('/upload', auth, upload.single('image'), uploadImage);
router.get('/my', auth, getMyImages);
router.get('/user/gallery', auth, getUserImagesWithLocations);
// Keep the dynamic route last to avoid conflicts
router.get('/:id', getImage);
router.delete('/:id', auth, deleteImage);

module.exports = router;