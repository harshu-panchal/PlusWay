const express = require('express');
const router = express.Router();
const dealController = require('../controllers/dealController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/active', dealController.getActiveDeal); // Public
router.get('/', protect, authorize('admin'), dealController.getAllDeals); // Admin only
router.post('/', protect, authorize('admin'), dealController.createDeal); // Admin only
router.put('/:id/toggle', protect, authorize('admin'), dealController.toggleDealStatus); // Admin only
router.delete('/:id', protect, authorize('admin'), dealController.deleteDeal); // Admin only

module.exports = router;
