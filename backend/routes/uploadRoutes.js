const express = require('express');
const router = express.Router();
const { uploadImage, parser } = require('../controllers/uploadController');

// Route: POST /api/upload
router.post('/', parser.single('image'), uploadImage);

module.exports = router;
