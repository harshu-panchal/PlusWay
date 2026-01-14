const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Storage Engine
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'appzeto_products',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    },
});

const parser = multer({ storage: storage });

// Upload Controller
const uploadImage = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    // CloudinaryStorage automatically uploads to Cloudinary and puts the URL in req.file.path
    res.status(200).json({
        url: req.file.path,
        public_id: req.file.filename
    });
};

module.exports = {
    parser,
    uploadImage
};
