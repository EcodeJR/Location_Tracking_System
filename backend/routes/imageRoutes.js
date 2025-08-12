const express = require('express');
const router = express.Router();
const { uploadImage, getImage } = require('../controllers/imageController');
const auth = require('../middleware/auth');
const { upload } = require('../services/storage');

// Protected upload route
router.post('/upload', auth, upload.single('image'), uploadImage);
router.get('/file/:id', getImage);

module.exports = router;