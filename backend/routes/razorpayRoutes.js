const express = require('express');
const router = express.Router();
const { createRazorpayOrder, verifyRazorpayPayment } = require('../controllers/orderController');
const { optionalProtect, protect } = require('../middleware/authMiddleware');

router.post('/create', optionalProtect, createRazorpayOrder);
router.post('/verify', verifyRazorpayPayment);

module.exports = router;
