/**
 * Translation Routes
 * Public endpoints for translation service (no auth required)
 */

const express = require('express');
const router = express.Router();
const translationController = require('../controllers/translationController');

// Single text translation
// POST /api/translate
// Body: { text: string, targetLang: string, sourceLang?: string }
router.post('/', translationController.translateText);

// Batch translation (max 100 texts)
// POST /api/translate/batch
// Body: { texts: string[], targetLang: string, sourceLang?: string }
router.post('/batch', translationController.translateBatch);

// Object property translation
// POST /api/translate/object
// Body: { object: Object, targetLang: string, sourceLang?: string, keys?: string[] }
router.post('/object', translationController.translateObject);

// Get supported languages
// GET /api/translate/languages
router.get('/languages', translationController.getSupportedLanguages);

// Get cache statistics
// GET /api/translate/stats
router.get('/stats', translationController.getCacheStats);

// Check if language is RTL
// GET /api/translate/rtl/:lang
router.get('/rtl/:lang', translationController.checkRTL);

module.exports = router;
