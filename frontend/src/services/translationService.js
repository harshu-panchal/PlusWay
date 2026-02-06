/**
 * Translation Service (Frontend)
 * API client for translation endpoints with request queuing and batching
 */

import api from '../shared/utils/api';
import {
    generateCacheKey,
    getFromCache,
    setInCache
} from '../shared/utils/translationCache';
import { normalizeLanguageCode } from '../shared/utils/languageUtils';

// Request queue management
let requestQueue = [];
let isProcessingQueue = false;
const BATCH_WAIT_TIME = 100; // ms to wait for collecting batch requests
const BATCH_SIZE = 10; // Max texts per batch
const MIN_REQUEST_INTERVAL = 200; // ms between requests
let lastRequestTime = 0;

/**
 * Wait for rate limit
 * @returns {Promise<void>}
 */
const waitForRateLimit = async () => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;

    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
        await new Promise(resolve =>
            setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest)
        );
    }

    lastRequestTime = Date.now();
};

/**
 * Process the request queue
 */
const processQueue = async () => {
    if (isProcessingQueue || requestQueue.length === 0) return;

    isProcessingQueue = true;

    try {
        // Wait for potential batch collection
        await new Promise(resolve => setTimeout(resolve, BATCH_WAIT_TIME));

        // Process up to BATCH_SIZE requests
        const batch = requestQueue.splice(0, BATCH_SIZE);

        if (batch.length === 0) {
            isProcessingQueue = false;
            return;
        }

        // Group by target/source language
        const groups = {};

        for (const request of batch) {
            const key = `${request.sourceLang}_${request.targetLang}`;
            if (!groups[key]) {
                groups[key] = {
                    sourceLang: request.sourceLang,
                    targetLang: request.targetLang,
                    requests: [],
                };
            }
            groups[key].requests.push(request);
        }

        // Process each language group
        for (const group of Object.values(groups)) {
            await waitForRateLimit();

            const texts = group.requests.map(r => r.text);

            try {
                const response = await api.post('/translate/batch', {
                    texts,
                    targetLang: group.targetLang,
                    sourceLang: group.sourceLang,
                });

                if (response.data?.success && response.data?.data?.translations) {
                    const translations = response.data.data.translations;

                    for (let i = 0; i < group.requests.length; i++) {
                        const request = group.requests[i];
                        const result = translations[i];

                        if (result) {
                            // Cache the translation
                            const cacheKey = generateCacheKey(
                                request.text,
                                group.sourceLang,
                                group.targetLang
                            );
                            await setInCache(
                                cacheKey,
                                request.text,
                                result.translation,
                                group.sourceLang,
                                group.targetLang
                            );

                            request.resolve(result.translation);
                        } else {
                            request.resolve(request.text);
                        }
                    }
                } else {
                    // Return original texts on failure
                    group.requests.forEach(r => r.resolve(r.text));
                }
            } catch (error) {
                console.error('Batch translation error:', error);
                group.requests.forEach(r => r.resolve(r.text));
            }
        }
    } catch (error) {
        console.error('Queue processing error:', error);
    }

    isProcessingQueue = false;

    // Continue processing if more items in queue
    if (requestQueue.length > 0) {
        processQueue();
    }
};

/**
 * Translate a single text
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language code
 * @param {string} sourceLang - Source language code (default: 'en')
 * @returns {Promise<string>} - Translated text
 */
export const translateText = async (text, targetLang, sourceLang = 'en') => {
    // Validate input
    if (!text || typeof text !== 'string' || !text.trim()) {
        return text || '';
    }

    const normalizedSource = normalizeLanguageCode(sourceLang);
    const normalizedTarget = normalizeLanguageCode(targetLang);

    // If same language, return original
    if (normalizedSource === normalizedTarget) {
        return text;
    }

    // Check cache first
    const cacheKey = generateCacheKey(text, normalizedSource, normalizedTarget);
    const cachedTranslation = await getFromCache(cacheKey);

    if (cachedTranslation) {
        return cachedTranslation;
    }

    // Add to queue and return promise
    return new Promise((resolve) => {
        requestQueue.push({
            text,
            sourceLang: normalizedSource,
            targetLang: normalizedTarget,
            resolve,
        });

        // Trigger queue processing
        processQueue();
    });
};

/**
 * Translate multiple texts in batch
 * @param {string[]} texts - Array of texts to translate
 * @param {string} targetLang - Target language code
 * @param {string} sourceLang - Source language code (default: 'en')
 * @returns {Promise<string[]>} - Array of translated texts
 */
export const translateBatch = async (texts, targetLang, sourceLang = 'en') => {
    if (!Array.isArray(texts) || texts.length === 0) {
        return [];
    }

    const normalizedSource = normalizeLanguageCode(sourceLang);
    const normalizedTarget = normalizeLanguageCode(targetLang);

    // If same language, return originals
    if (normalizedSource === normalizedTarget) {
        return texts;
    }

    // Process all texts through translate queue
    const translationPromises = texts.map(text =>
        translateText(text, normalizedTarget, normalizedSource)
    );

    return Promise.all(translationPromises);
};

/**
 * Translate specific keys in an object
 * @param {Object} obj - Object to translate
 * @param {string[]} keysToTranslate - Array of keys to translate
 * @param {string} targetLang - Target language code
 * @param {string} sourceLang - Source language code (default: 'en')
 * @returns {Promise<Object>} - Object with translated values
 */
export const translateObject = async (obj, keysToTranslate, targetLang, sourceLang = 'en') => {
    if (!obj || typeof obj !== 'object') {
        return obj;
    }

    const normalizedSource = normalizeLanguageCode(sourceLang);
    const normalizedTarget = normalizeLanguageCode(targetLang);

    // If same language, return original
    if (normalizedSource === normalizedTarget) {
        return { ...obj };
    }

    // Collect texts to translate
    const keysWithTexts = [];

    for (const key of keysToTranslate) {
        if (obj.hasOwnProperty(key) && typeof obj[key] === 'string' && obj[key].trim()) {
            keysWithTexts.push({ key, text: obj[key] });
        }
    }

    if (keysWithTexts.length === 0) {
        return { ...obj };
    }

    // Translate all texts
    const translations = await translateBatch(
        keysWithTexts.map(k => k.text),
        normalizedTarget,
        normalizedSource
    );

    // Build translated object
    const translatedObj = { ...obj };

    for (let i = 0; i < keysWithTexts.length; i++) {
        translatedObj[keysWithTexts[i].key] = translations[i];
    }

    return translatedObj;
};

/**
 * Translate an array of objects
 * @param {Object[]} objects - Array of objects to translate
 * @param {string[]} keysToTranslate - Array of keys to translate
 * @param {string} targetLang - Target language code
 * @param {string} sourceLang - Source language code (default: 'en')
 * @returns {Promise<Object[]>} - Array of translated objects
 */
export const translateObjectArray = async (objects, keysToTranslate, targetLang, sourceLang = 'en') => {
    if (!Array.isArray(objects) || objects.length === 0) {
        return [];
    }

    const translationPromises = objects.map(obj =>
        translateObject(obj, keysToTranslate, targetLang, sourceLang)
    );

    return Promise.all(translationPromises);
};

/**
 * Get supported languages from API
 * @returns {Promise<Object>}
 */
export const getSupportedLanguages = async () => {
    try {
        const response = await api.get('/translate/languages');
        return response.data?.data || {};
    } catch (error) {
        console.error('Failed to get supported languages:', error);
        return {};
    }
};

export default {
    translateText,
    translateBatch,
    translateObject,
    translateObjectArray,
    getSupportedLanguages,
};
