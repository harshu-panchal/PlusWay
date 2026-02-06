/**
 * Translation Controller
 * Handles HTTP requests for translation endpoints
 */

const translationService = require('../services/translationService');
const { supportedLanguages, normalizeLanguageCode, isRTL } = require('../config/googleCloud');

/**
 * Translate a single text
 * POST /api/translate
 * Body: { text: string, targetLang: string, sourceLang?: string }
 */
const translateText = async (req, res) => {
    try {
        const { text, targetLang, sourceLang = 'en' } = req.body;

        // Validate input
        if (!text || typeof text !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Text is required and must be a string',
            });
        }

        if (!targetLang) {
            return res.status(400).json({
                success: false,
                error: 'Target language is required',
            });
        }

        const result = await translationService.translateText(text, targetLang, sourceLang);

        res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error('Translation controller error:', error);

        if (error.code === 429 || error.message?.includes('rate limit')) {
            return res.status(429).json({
                success: false,
                error: 'Rate limit exceeded. Please try again later.',
                retryAfter: 60,
            });
        }

        res.status(500).json({
            success: false,
            error: 'Translation failed',
            message: error.message,
        });
    }
};

/**
 * Translate multiple texts in batch
 * POST /api/translate/batch
 * Body: { texts: string[], targetLang: string, sourceLang?: string }
 */
const translateBatch = async (req, res) => {
    try {
        const { texts, targetLang, sourceLang = 'en' } = req.body;

        // Validate input
        if (!Array.isArray(texts) || texts.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Texts array is required and must not be empty',
            });
        }

        if (texts.length > 100) {
            return res.status(400).json({
                success: false,
                error: 'Maximum 100 texts allowed per batch',
            });
        }

        if (!targetLang) {
            return res.status(400).json({
                success: false,
                error: 'Target language is required',
            });
        }

        const results = await translationService.translateBatch(texts, targetLang, sourceLang);

        res.json({
            success: true,
            data: {
                translations: results,
                count: results.length,
                sourceLang: normalizeLanguageCode(sourceLang),
                targetLang: normalizeLanguageCode(targetLang),
            },
        });
    } catch (error) {
        console.error('Batch translation controller error:', error);

        if (error.code === 429 || error.message?.includes('rate limit')) {
            return res.status(429).json({
                success: false,
                error: 'Rate limit exceeded. Please try again later.',
                retryAfter: 60,
            });
        }

        res.status(500).json({
            success: false,
            error: 'Batch translation failed',
            message: error.message,
        });
    }
};

/**
 * Translate object properties
 * POST /api/translate/object
 * Body: { object: Object, targetLang: string, sourceLang?: string, keys?: string[] }
 */
const translateObject = async (req, res) => {
    try {
        const { object, targetLang, sourceLang = 'en', keys = [] } = req.body;

        // Validate input
        if (!object || typeof object !== 'object' || Array.isArray(object)) {
            return res.status(400).json({
                success: false,
                error: 'Object is required and must be a valid object',
            });
        }

        if (!targetLang) {
            return res.status(400).json({
                success: false,
                error: 'Target language is required',
            });
        }

        const translatedObject = await translationService.translateObject(
            object,
            targetLang,
            sourceLang,
            keys
        );

        res.json({
            success: true,
            data: {
                original: object,
                translated: translatedObject,
                sourceLang: normalizeLanguageCode(sourceLang),
                targetLang: normalizeLanguageCode(targetLang),
            },
        });
    } catch (error) {
        console.error('Object translation controller error:', error);

        if (error.code === 429 || error.message?.includes('rate limit')) {
            return res.status(429).json({
                success: false,
                error: 'Rate limit exceeded. Please try again later.',
                retryAfter: 60,
            });
        }

        res.status(500).json({
            success: false,
            error: 'Object translation failed',
            message: error.message,
        });
    }
};

/**
 * Get supported languages
 * GET /api/translate/languages
 */
const getSupportedLanguages = async (req, res) => {
    try {
        res.json({
            success: true,
            data: {
                languages: supportedLanguages,
                rtlLanguages: Object.entries(supportedLanguages)
                    .filter(([, info]) => info.rtl)
                    .map(([code]) => code),
            },
        });
    } catch (error) {
        console.error('Get languages error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get supported languages',
        });
    }
};

/**
 * Get cache statistics
 * GET /api/translate/stats
 */
const getCacheStats = async (req, res) => {
    try {
        const stats = translationService.getCacheStats();

        res.json({
            success: true,
            data: stats,
        });
    } catch (error) {
        console.error('Get cache stats error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get cache statistics',
        });
    }
};

/**
 * Check if language is RTL
 * GET /api/translate/rtl/:lang
 */
const checkRTL = async (req, res) => {
    try {
        const { lang } = req.params;

        res.json({
            success: true,
            data: {
                language: lang,
                normalized: normalizeLanguageCode(lang),
                isRTL: isRTL(lang),
            },
        });
    } catch (error) {
        console.error('Check RTL error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to check RTL status',
        });
    }
};

module.exports = {
    translateText,
    translateBatch,
    translateObject,
    getSupportedLanguages,
    getCacheStats,
    checkRTL,
};
