/**
 * useDynamicTranslation Hook
 * For translating API responses and dynamic content at runtime
 * 
 * @example
 * const { translate, translateBatch, translateObject, isTranslating } = useDynamicTranslation();
 * 
 * // Single text
 * const translated = await translate("Hello World");
 * 
 * // Batch texts
 * const translations = await translateBatch(["Hello", "World"]);
 * 
 * // Object translation
 * const product = await translateObject(productData, ['name', 'description']);
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import translationService from '../services/translationService';

/**
 * Dynamic translation hook for API data and user-generated content
 * @param {Object} options - Configuration options
 * @param {string} options.sourceLang - Source language code (default: 'en')
 * @returns {Object} Translation utilities
 */
export const useDynamicTranslation = (options = {}) => {
    const { sourceLang = 'en' } = options;
    const { language } = useLanguage();

    const [isTranslating, setIsTranslating] = useState(false);
    const [error, setError] = useState(null);
    const activeRequestsRef = useRef(0);

    /**
     * Update translating state based on active requests
     */
    const updateTranslatingState = useCallback(() => {
        setIsTranslating(activeRequestsRef.current > 0);
    }, []);

    /**
     * Translate a single text string
     * @param {string} text - Text to translate
     * @returns {Promise<string>} - Translated text
     */
    const translate = useCallback(async (text) => {
        if (!text || typeof text !== 'string' || !text.trim()) {
            return text || '';
        }

        // If source and target are the same, return original
        if (sourceLang === language) {
            return text;
        }

        activeRequestsRef.current++;
        updateTranslatingState();
        setError(null);

        try {
            const translated = await translationService.translateText(text, language, sourceLang);
            return translated;
        } catch (err) {
            console.error('Translation error:', err);
            setError(err.message);
            return text; // Return original on error
        } finally {
            activeRequestsRef.current--;
            updateTranslatingState();
        }
    }, [language, sourceLang, updateTranslatingState]);

    /**
     * Translate multiple texts in batch
     * @param {string[]} texts - Array of texts to translate
     * @returns {Promise<string[]>} - Array of translated texts
     */
    const translateBatch = useCallback(async (texts) => {
        if (!Array.isArray(texts) || texts.length === 0) {
            return [];
        }

        // If source and target are the same, return originals
        if (sourceLang === language) {
            return texts;
        }

        activeRequestsRef.current++;
        updateTranslatingState();
        setError(null);

        try {
            const translated = await translationService.translateBatch(texts, language, sourceLang);
            return translated;
        } catch (err) {
            console.error('Batch translation error:', err);
            setError(err.message);
            return texts; // Return originals on error
        } finally {
            activeRequestsRef.current--;
            updateTranslatingState();
        }
    }, [language, sourceLang, updateTranslatingState]);

    /**
     * Translate specific keys in an object
     * @param {Object} obj - Object to translate
     * @param {string[]} keysToTranslate - Keys to translate
     * @returns {Promise<Object>} - Object with translated values
     */
    const translateObject = useCallback(async (obj, keysToTranslate = []) => {
        if (!obj || typeof obj !== 'object') {
            return obj;
        }

        // If source and target are the same, return original
        if (sourceLang === language) {
            return { ...obj };
        }

        activeRequestsRef.current++;
        updateTranslatingState();
        setError(null);

        try {
            const translated = await translationService.translateObject(
                obj,
                keysToTranslate,
                language,
                sourceLang
            );
            return translated;
        } catch (err) {
            console.error('Object translation error:', err);
            setError(err.message);
            return { ...obj }; // Return original on error
        } finally {
            activeRequestsRef.current--;
            updateTranslatingState();
        }
    }, [language, sourceLang, updateTranslatingState]);

    /**
     * Translate an array of objects
     * @param {Object[]} objects - Array of objects to translate
     * @param {string[]} keysToTranslate - Keys to translate
     * @returns {Promise<Object[]>} - Array of translated objects
     */
    const translateObjectArray = useCallback(async (objects, keysToTranslate = []) => {
        if (!Array.isArray(objects) || objects.length === 0) {
            return [];
        }

        // If source and target are the same, return originals
        if (sourceLang === language) {
            return objects.map(obj => ({ ...obj }));
        }

        activeRequestsRef.current++;
        updateTranslatingState();
        setError(null);

        try {
            const translated = await translationService.translateObjectArray(
                objects,
                keysToTranslate,
                language,
                sourceLang
            );
            return translated;
        } catch (err) {
            console.error('Object array translation error:', err);
            setError(err.message);
            return objects.map(obj => ({ ...obj })); // Return originals on error
        } finally {
            activeRequestsRef.current--;
            updateTranslatingState();
        }
    }, [language, sourceLang, updateTranslatingState]);

    return {
        translate,
        translateBatch,
        translateObject,
        translateObjectArray,
        isTranslating,
        error,
        currentLanguage: language,
        sourceLanguage: sourceLang,
    };
};

export default useDynamicTranslation;
