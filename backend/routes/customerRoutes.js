const express = require('express');
const {
    getCustomers,
    getCustomer,
    updateCustomer,
    deleteCustomer
} = require('../controllers/customerController');

const router = express.Router();

const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('admin'));

router
    .route('/')
    .get(getCustomers);

router
    .route('/:id')
    .get(getCustomer)
    .put(updateCustomer)
    .delete(deleteCustomer);

module.exports = router;
