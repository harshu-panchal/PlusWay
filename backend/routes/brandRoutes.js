const express = require('express');
const router = express.Router();
const {
    createBrand,
    getBrands,
    getBrandById,
    updateBrand,
    deleteBrand,
    setBrandVisibility
} = require('../controllers/brandController');
const { protect, authorize, optionalProtect } = require('../middleware/authMiddleware');

router.get('/', optionalProtect, getBrands);
router.get('/:id', getBrandById);
router.post('/', createBrand);
router.put('/:id', updateBrand);
router.patch('/:id/visibility', protect, authorize('admin'), setBrandVisibility);
router.delete('/:id', deleteBrand);

module.exports = router;
