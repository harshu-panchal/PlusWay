const express = require('express');
const router = express.Router();
const {
    getAssignedOrders,
    updateDeliveryStatus,
    getDeliveryHistory,
    getProfile,
    getAllDeliveryBoys,
    createDeliveryBoy,
    updateDeliveryBoy,
    deleteDeliveryBoy
} = require('../controllers/deliveryController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

// Admin Routes (Before generic delivery middleware if we want clean separation, but here we can just use specific paths)
router.get('/admin/all', authorize('admin'), getAllDeliveryBoys);
router.post('/admin/create', authorize('admin'), createDeliveryBoy);
router.put('/admin/:id', authorize('admin'), updateDeliveryBoy);
router.delete('/admin/:id', authorize('admin'), deleteDeliveryBoy);

// Valid Delivery Boy Routes
router.get('/assigned', authorize('delivery'), getAssignedOrders);
router.put('/orders/:id/status', authorize('delivery'), updateDeliveryStatus);
router.get('/history', authorize('delivery'), getDeliveryHistory);
router.get('/profile', authorize('delivery'), getProfile);

module.exports = router;
