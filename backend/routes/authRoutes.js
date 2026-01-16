const express = require('express');
const { register, registerDelivery, login, logout, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const Joi = require('joi');
const validate = require('../middleware/validate');

const registerSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('customer', 'admin', 'delivery').default('customer')
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/register-delivery', registerDelivery); // Assuming delivery has different fields, skipping for now
router.post('/login', validate(loginSchema), login);
router.get('/logout', logout);
router.get('/me', protect, getMe);

module.exports = router;
