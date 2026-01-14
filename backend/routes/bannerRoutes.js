const express = require('express');
const router = express.Router();
const { getBanners, getAllBannersAdmin, createBanner, updateBanner, deleteBanner } = require('../controllers/bannerController');

// Public
router.get('/', getBanners);

// Admin
router.get('/admin', getAllBannersAdmin);
router.post('/', createBanner);
router.put('/:id', updateBanner);
router.delete('/:id', deleteBanner);

module.exports = router;
