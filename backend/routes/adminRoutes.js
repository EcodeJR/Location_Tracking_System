const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { isAdmin } = require('../middleware/roles');
const { listUploads } = require('../controllers/adminController');

router.get('/uploads', auth, isAdmin, listUploads);

module.exports = router;