/**
 * Language Context
 * Global state management for language preferences with RTL support
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
    SUPPORTED_LANGUAGES,
    normalizeLanguageCode,
    isRTL,
    getSavedLanguage,
    saveLanguagePreference,
    getBrowserLanguage,
} from '../shared/utils/languageUtils';
import { clearCache } from '../shared/utils/translationCache';

// Create context
const LanguageContext = createContext(null);

// Default language
const DEFAULT_LANGUAGE = 'en';

/**
 * Language Provider Component
 * Wraps the app to provide language context to all children
 */
export const LanguageProvider = ({ children }) => {
    // Initialize language from saved preference or browser default
    const [language, setLanguage] = useState(() => {
        const saved = getSavedLanguage();
        if (saved && SUPPORTED_LANGUAGES[saved]) {
            return saved;
        }

        const browserLang = getBrowserLanguage();
        if (SUPPORTED_LANGUAGES[browserLang]) {
            return browserLang;
        }

        return DEFAULT_LANGUAGE;
    });

    const [isChangingLanguage, setIsChangingLanguage] = useState(false);
    const [isRTLEnabled, setIsRTLEnabled] = useState(false);

    /**
     * Update document direction based on language
     */
    const updateDocumentDirection = useCallback((lang) => {
        const rtl = isRTL(lang);
        setIsRTLEnabled(rtl);

        // Update document direction
        document.documentElement.dir = rtl ? 'rtl' : 'ltr';
        document.documentElement.lang = lang;

        // Update body class for CSS targeting
        document.body.classList.remove('rtl', 'ltr');
        document.body.classList.add(rtl ? 'rtl' : 'ltr');
    }, []);

    /**
     * Change the current language
     * @param {string} newLanguage - Language code to switch to
     */
    const changeLanguage = useCallback(async (newLanguage) => {
        const normalized = normalizeLanguageCode(newLanguage);

        if (normalized === language) return;

        if (!SUPPORTED_LANGUAGES[normalized]) {
            console.warn(`Language "${newLanguage}" is not supported, falling back to "${DEFAULT_LANGUAGE}"`);
            return;
        }

        setIsChangingLanguage(true);

        try {
            // Save preference
            saveLanguagePreference(normalized);

            // Update state
            setLanguage(normalized);

            // Update document direction
            updateDocumentDirection(normalized);

            // Optional: Clear translation cache when language changes
            // Uncomment if you want to clear cache on language change
            // await clearCache();

            console.log(`🌐 Language changed to: ${SUPPORTED_LANGUAGES[normalized]?.label || normalized}`);
        } catch (error) {
            console.error('Error changing language:', error);
        } finally {
            setIsChangingLanguage(false);
        }
    }, [language, updateDocumentDirection]);

    /**
     * Get info about a specific language
     * @param {string} langCode - Language code
     * @returns {Object|null}
     */
    const getLanguageInfo = useCallback((langCode) => {
        const normalized = normalizeLanguageCode(langCode);
        return SUPPORTED_LANGUAGES[normalized] || null;
    }, []);

    /**
     * Check if a specific language is RTL
     * @param {string} langCode - Language code (optional, uses current if not provided)
     * @returns {boolean}
     */
    const checkIsRTL = useCallback((langCode = language) => {
        return isRTL(langCode);
    }, [language]);

    // Initialize document direction on mount
    useEffect(() => {
        updateDocumentDirection(language);
    }, [language, updateDocumentDirection]);

    // Context value
    const contextValue = {
        // Current language state
        language,

        // All supported languages
        languages: SUPPORTED_LANGUAGES,

        // RTL state
        isRTL: isRTLEnabled,

        // Loading state
        isChangingLanguage,

        // Actions
        changeLanguage,
        getLanguageInfo,
        checkIsRTL,

        // Current language info
        currentLanguageInfo: SUPPORTED_LANGUAGES[language] || { label: language },
    };

    return (
        <LanguageContext.Provider value={contextValue}>
            {children}
        </LanguageContext.Provider>
    );
};

/**
 * useLanguage Hook
 * Access language context in any component
 * 
 * @example
 * const { language, changeLanguage, languages, isRTL } = useLanguage();
 */
export const useLanguage = () => {
    const context = useContext(LanguageContext);

    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }

    return context;
};

export default LanguageContext;
