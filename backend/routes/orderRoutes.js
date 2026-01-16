const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, getMyOrders, getAllOrders, getCustomerOrders, updateOrderStatus, assignOrder } = require('../controllers/orderController');
const { protect, optionalProtect, authorize } = require('../middleware/authMiddleware');

router.post('/create', optionalProtect, createOrder);
router.post('/verify', verifyPayment);
router.get('/my-orders', protect, getMyOrders);

// Admin Routes
router.get('/admin/all', protect, authorize('admin'), getAllOrders);
router.get('/admin/customer/:id', protect, authorize('admin'), getCustomerOrders);
router.put('/admin/:id/status', protect, authorize('admin'), updateOrderStatus);
router.put('/admin/assign', protect, authorize('admin'), assignOrder); // New route

module.exports = router;
