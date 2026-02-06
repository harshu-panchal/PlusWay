/**
 * Translation Service
 * Core translation logic with caching, batching, and retry functionality
 */

const { getTranslateClient, normalizeLanguageCode } = require('../config/googleCloud');

// In-memory cache with TTL (24 hours)
const translationCache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Rate limiting
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 100; // Minimum 100ms between requests

/**
 * Generate cache key for translations
 * @param {string} text - Original text
 * @param {string} sourceLang - Source language code
 * @param {string} targetLang - Target language code
 * @returns {string} - Cache key
 */
const generateCacheKey = (text, sourceLang, targetLang) => {
    const normalizedSource = normalizeLanguageCode(sourceLang);
    const normalizedTarget = normalizeLanguageCode(targetLang);
    const base64Text = Buffer.from(text).toString('base64');
    return `${normalizedSource}_${normalizedTarget}_${base64Text}`;
};

/**
 * Get cached translation
 * @param {string} key - Cache key
 * @returns {string|null} - Cached translation or null
 */
const getCachedTranslation = (key) => {
    const cached = translationCache.get(key);
    if (!cached) return null;

    // Check if cache entry has expired
    if (Date.now() - cached.timestamp > CACHE_TTL) {
        translationCache.delete(key);
        return null;
    }

    return cached.translation;
};

/**
 * Set cache entry
 * @param {string} key - Cache key
 * @param {string} originalText - Original text
 * @param {string} translation - Translated text
 */
const setCacheEntry = (key, originalText, translation) => {
    // Don't cache if translation equals original (indicates potential failure)
    if (translation === originalText) return;

    translationCache.set(key, {
        translation,
        timestamp: Date.now(),
    });
};

/**
 * Clean up expired cache entries
 */
const cleanupCache = () => {
    const now = Date.now();
    for (const [key, value] of translationCache.entries()) {
        if (now - value.timestamp > CACHE_TTL) {
            translationCache.delete(key);
        }
    }
};

// Run cleanup every hour
setInterval(cleanupCache, 60 * 60 * 1000);

/**
 * Rate limit helper with exponential backoff
 * @param {number} attempt - Current attempt number
 * @returns {Promise<void>}
 */
const waitForRateLimit = async (attempt = 0) => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;

    let delay = MIN_REQUEST_INTERVAL - timeSinceLastRequest;

    // Add exponential backoff for retries
    if (attempt > 0) {
        delay = Math.max(delay, Math.pow(2, attempt) * 1000); // 1s, 2s, 4s, 8s...
    }

    if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
    }

    lastRequestTime = Date.now();
};

/**
 * Translate a single text string
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language code
 * @param {string} sourceLang - Source language code (default: 'en')
 * @param {number} retryCount - Current retry attempt
 * @returns {Promise<{original: string, translation: string, sourceLang: string, targetLang: string}>}
 */
const translateText = async (text, targetLang, sourceLang = 'en', retryCount = 0) => {
    // Validate input
    if (!text || typeof text !== 'string' || !text.trim()) {
        return {
            original: text || '',
            translation: text || '',
            sourceLang,
            targetLang,
        };
    }

    const normalizedSource = normalizeLanguageCode(sourceLang);
    const normalizedTarget = normalizeLanguageCode(targetLang);

    // If source and target are the same, return original
    if (normalizedSource === normalizedTarget) {
        return {
            original: text,
            translation: text,
            sourceLang: normalizedSource,
            targetLang: normalizedTarget,
        };
    }

    // Check cache first
    const cacheKey = generateCacheKey(text, normalizedSource, normalizedTarget);
    const cachedTranslation = getCachedTranslation(cacheKey);

    if (cachedTranslation) {
        return {
            original: text,
            translation: cachedTranslation,
            sourceLang: normalizedSource,
            targetLang: normalizedTarget,
            cached: true,
        };
    }

    // Get translate client
    const translateClient = getTranslateClient();
    if (!translateClient) {
        console.error('Translation client not available');
        return {
            original: text,
            translation: text,
            sourceLang: normalizedSource,
            targetLang: normalizedTarget,
            error: 'Translation service unavailable',
        };
    }

    try {
        await waitForRateLimit(retryCount);

        const [translation] = await translateClient.translate(text, {
            from: normalizedSource,
            to: normalizedTarget,
        });

        // Cache the result
        setCacheEntry(cacheKey, text, translation);

        return {
            original: text,
            translation,
            sourceLang: normalizedSource,
            targetLang: normalizedTarget,
        };
    } catch (error) {
        console.error('Translation error:', error.message);

        // Retry logic with exponential backoff
        if (retryCount < 3 && (error.code === 429 || error.message?.includes('rate limit'))) {
            console.log(`Retrying translation (attempt ${retryCount + 1})...`);
            return translateText(text, targetLang, sourceLang, retryCount + 1);
        }

        // Return original text on failure
        return {
            original: text,
            translation: text,
            sourceLang: normalizedSource,
            targetLang: normalizedTarget,
            error: error.message,
        };
    }
};

/**
 * Translate multiple texts in batch
 * @param {string[]} texts - Array of texts to translate
 * @param {string} targetLang - Target language code
 * @param {string} sourceLang - Source language code (default: 'en')
 * @returns {Promise<Array<{original: string, translation: string, sourceLang: string, targetLang: string}>>}
 */
const translateBatch = async (texts, targetLang, sourceLang = 'en') => {
    if (!Array.isArray(texts) || texts.length === 0) {
        return [];
    }

    // Limit batch size to 100
    const batchSize = Math.min(texts.length, 100);
    const textsToTranslate = texts.slice(0, batchSize);

    const normalizedSource = normalizeLanguageCode(sourceLang);
    const normalizedTarget = normalizeLanguageCode(targetLang);

    // If source and target are the same, return originals
    if (normalizedSource === normalizedTarget) {
        return textsToTranslate.map(text => ({
            original: text,
            translation: text,
            sourceLang: normalizedSource,
            targetLang: normalizedTarget,
        }));
    }

    const results = [];
    const uncachedTexts = [];
    const uncachedIndices = [];

    // Check cache for each text
    for (let i = 0; i < textsToTranslate.length; i++) {
        const text = textsToTranslate[i];

        // Skip empty or invalid texts
        if (!text || typeof text !== 'string' || !text.trim()) {
            results[i] = {
                original: text || '',
                translation: text || '',
                sourceLang: normalizedSource,
                targetLang: normalizedTarget,
            };
            continue;
        }

        const cacheKey = generateCacheKey(text, normalizedSource, normalizedTarget);
        const cachedTranslation = getCachedTranslation(cacheKey);

        if (cachedTranslation) {
            results[i] = {
                original: text,
                translation: cachedTranslation,
                sourceLang: normalizedSource,
                targetLang: normalizedTarget,
                cached: true,
            };
        } else {
            uncachedTexts.push(text);
            uncachedIndices.push(i);
        }
    }

    // If all cached, return results
    if (uncachedTexts.length === 0) {
        return results;
    }

    // Get translate client
    const translateClient = getTranslateClient();
    if (!translateClient) {
        // Return original texts for uncached items
        for (let i = 0; i < uncachedIndices.length; i++) {
            const index = uncachedIndices[i];
            results[index] = {
                original: uncachedTexts[i],
                translation: uncachedTexts[i],
                sourceLang: normalizedSource,
                targetLang: normalizedTarget,
                error: 'Translation service unavailable',
            };
        }
        return results;
    }

    try {
        await waitForRateLimit();

        const [translations] = await translateClient.translate(uncachedTexts, {
            from: normalizedSource,
            to: normalizedTarget,
        });

        // Map translations back to results
        const translationsArray = Array.isArray(translations) ? translations : [translations];

        for (let i = 0; i < uncachedIndices.length; i++) {
            const index = uncachedIndices[i];
            const originalText = uncachedTexts[i];
            const translatedText = translationsArray[i] || originalText;

            // Cache the result
            const cacheKey = generateCacheKey(originalText, normalizedSource, normalizedTarget);
            setCacheEntry(cacheKey, originalText, translatedText);

            results[index] = {
                original: originalText,
                translation: translatedText,
                sourceLang: normalizedSource,
                targetLang: normalizedTarget,
            };
        }

        return results;
    } catch (error) {
        console.error('Batch translation error:', error.message);

        // Return original texts for failed items
        for (let i = 0; i < uncachedIndices.length; i++) {
            const index = uncachedIndices[i];
            results[index] = {
                original: uncachedTexts[i],
                translation: uncachedTexts[i],
                sourceLang: normalizedSource,
                targetLang: normalizedTarget,
                error: error.message,
            };
        }

        return results;
    }
};

/**
 * Translate specific keys in an object
 * @param {Object} obj - Object to translate
 * @param {string} targetLang - Target language code
 * @param {string} sourceLang - Source language code (default: 'en')
 * @param {string[]} keysToTranslate - Array of keys to translate
 * @returns {Promise<Object>} - Object with translated values
 */
const translateObject = async (obj, targetLang, sourceLang = 'en', keysToTranslate = []) => {
    if (!obj || typeof obj !== 'object') {
        return obj;
    }

    // If no keys specified, translate all string values
    const keys = keysToTranslate.length > 0
        ? keysToTranslate
        : Object.keys(obj).filter(key => typeof obj[key] === 'string');

    // Collect texts to translate
    const textsToTranslate = [];
    const keyMapping = [];

    for (const key of keys) {
        if (obj.hasOwnProperty(key) && typeof obj[key] === 'string' && obj[key].trim()) {
            textsToTranslate.push(obj[key]);
            keyMapping.push(key);
        }
    }

    if (textsToTranslate.length === 0) {
        return { ...obj };
    }

    // Translate in batch
    const translations = await translateBatch(textsToTranslate, targetLang, sourceLang);

    // Build translated object
    const translatedObj = { ...obj };

    for (let i = 0; i < keyMapping.length; i++) {
        const key = keyMapping[i];
        translatedObj[key] = translations[i]?.translation || obj[key];
    }

    return translatedObj;
};

/**
 * Get cache statistics
 * @returns {Object} - Cache statistics
 */
const getCacheStats = () => {
    return {
        size: translationCache.size,
        estimatedMemoryMB: (translationCache.size * 200) / (1024 * 1024), // Rough estimate
    };
};

module.exports = {
    translateText,
    translateBatch,
    translateObject,
    getCacheStats,
    cleanupCache,
};
