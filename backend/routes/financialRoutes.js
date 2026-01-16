const express = require('express');
const { getFinancialStats, getTransactions } = require('../controllers/financialController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getFinancialStats);
router.get('/transactions', getTransactions);

module.exports = router;
