const express = require('express');
const router = express.Router();
const { createCategory, getCategories, getCategoryById, getCategoryBySlug, updateCategory, deleteCategory } = require('../controllers/categoryController');
const { optionalProtect } = require('../middleware/authMiddleware');

router.post('/', createCategory);
router.get('/', optionalProtect, getCategories);
router.get('/slug/:slug', optionalProtect, getCategoryBySlug);
router.get('/:id', optionalProtect, getCategoryById);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

module.exports = router;
