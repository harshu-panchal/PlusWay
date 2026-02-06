/**
 * usePageTranslation Hook
 * For translating static page content with better batching performance
 * 
 * @example
 * const staticTexts = ["Welcome", "Home", "About", "Contact"];
 * const { getTranslatedText, isTranslating, translations } = usePageTranslation(staticTexts);
 * 
 * // In JSX
 * <h1>{getTranslatedText("Welcome")}</h1>
 * <nav>
 *   <a>{getTranslatedText("Home")}</a>
 *   <a>{getTranslatedText("About")}</a>
 * </nav>
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import translationService from '../services/translationService';

/**
 * Static page content translation hook with optimized batching
 * @param {string[]} texts - Array of static texts to pre-translate
 * @param {Object} options - Configuration options
 * @param {string} options.sourceLang - Source language code (default: 'en')
 * @returns {Object} Translation utilities and state
 */
export const usePageTranslation = (texts = [], options = {}) => {
    const { sourceLang = 'en' } = options;
    const { language } = useLanguage();

    const [translations, setTranslations] = useState({});
    const [isTranslating, setIsTranslating] = useState(false);
    const [error, setError] = useState(null);

    // Track previous language to detect changes
    const prevLanguageRef = useRef(language);
    const textsRef = useRef(texts);

    // Memoize unique texts to avoid re-translations
    const uniqueTexts = useMemo(() => {
        const filtered = texts.filter(t => t && typeof t === 'string' && t.trim());
        return [...new Set(filtered)];
    }, [texts]);

    /**
     * Translate all static texts
     */
    const translateTexts = useCallback(async () => {
        if (uniqueTexts.length === 0) {
            setTranslations({});
            return;
        }

        // If source and target are the same, use original texts
        if (sourceLang === language) {
            const originalMap = {};
            uniqueTexts.forEach(text => {
                originalMap[text] = text;
            });
            setTranslations(originalMap);
            return;
        }

        setIsTranslating(true);
        setError(null);

        try {
            const translatedTexts = await translationService.translateBatch(
                uniqueTexts,
                language,
                sourceLang
            );

            // Build translation map
            const translationMap = {};
            uniqueTexts.forEach((text, index) => {
                translationMap[text] = translatedTexts[index] || text;
            });

            setTranslations(translationMap);
        } catch (err) {
            console.error('Page translation error:', err);
            setError(err.message);

            // Fallback to original texts
            const fallbackMap = {};
            uniqueTexts.forEach(text => {
                fallbackMap[text] = text;
            });
            setTranslations(fallbackMap);
        } finally {
            setIsTranslating(false);
        }
    }, [uniqueTexts, language, sourceLang]);

    // Translate when language changes or texts change
    useEffect(() => {
        const languageChanged = prevLanguageRef.current !== language;
        const textsChanged = JSON.stringify(textsRef.current) !== JSON.stringify(texts);

        if (languageChanged || textsChanged || Object.keys(translations).length === 0) {
            prevLanguageRef.current = language;
            textsRef.current = texts;
            translateTexts();
        }
    }, [language, texts, translateTexts, translations]);

    /**
     * Get translated text by original
     * @param {string} originalText - Original text to get translation for
     * @returns {string} - Translated text or original if not found
     */
    const getTranslatedText = useCallback((originalText) => {
        if (!originalText || typeof originalText !== 'string') {
            return originalText || '';
        }

        // If translation exists, return it
        if (translations[originalText] !== undefined) {
            return translations[originalText];
        }

        // If still translating or not in our list, return original
        return originalText;
    }, [translations]);

    /**
     * Force re-translation of all texts
     */
    const retranslate = useCallback(() => {
        translateTexts();
    }, [translateTexts]);

    /**
     * Get translation with fallback
     * Useful for conditional rendering while loading
     * @param {string} originalText - Original text
     * @param {string} fallback - Fallback text (default: original)
     * @returns {string}
     */
    const getWithFallback = useCallback((originalText, fallback) => {
        const translated = getTranslatedText(originalText);
        return translated || fallback || originalText;
    }, [getTranslatedText]);

    return {
        // Get single translated text
        getTranslatedText,

        // Get with fallback option
        getWithFallback,

        // All translations map
        translations,

        // Loading state
        isTranslating,

        // Error state
        error,

        // Force retranslation
        retranslate,

        // Current language info
        currentLanguage: language,
        sourceLanguage: sourceLang,
    };
};

/**
 * Shorthand alias for getTranslatedText
 * @example
 * const { t, isTranslating } = usePageTranslation(["Hello", "World"]);
 * return <h1>{t("Hello")}</h1>
 */
export const useTranslation = (texts = [], options = {}) => {
    const result = usePageTranslation(texts, options);

    return {
        ...result,
        t: result.getTranslatedText,
    };
};

export default usePageTranslation;
