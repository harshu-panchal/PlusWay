const express = require('express');
const router = express.Router();
const { createCategory, getCategories, getCategoryById, getCategoryBySlug, updateCategory, deleteCategory } = require('../controllers/categoryController');

router.post('/', createCategory);
router.get('/', getCategories);
router.get('/slug/:slug', getCategoryBySlug);
router.get('/:id', getCategoryById);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

module.exports = router;
