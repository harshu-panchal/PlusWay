/**
 * Language Utilities
 * Provides language code normalization and RTL detection for the translation system
 */

// Language code mapping - Maps frontend locale codes to Google Translate API codes
export const languageCodeMap = {
    // English variants
    'en': 'en',
    'en-US': 'en',
    'en-GB': 'en',
    'en-AU': 'en',

    // Arabic variants
    'ar': 'ar',
    'ar-SA': 'ar',
    'ar-AE': 'ar',
    'ar-KW': 'ar',

    // Hindi
    'hi': 'hi',
    'hi-IN': 'hi',

    // Spanish variants
    'es': 'es',
    'es-ES': 'es',
    'es-MX': 'es',

    // French variants
    'fr': 'fr',
    'fr-FR': 'fr',
    'fr-CA': 'fr',

    // German
    'de': 'de',
    'de-DE': 'de',

    // Portuguese variants
    'pt': 'pt',
    'pt-BR': 'pt',
    'pt-PT': 'pt',

    // Chinese variants
    'zh': 'zh-CN',
    'zh-CN': 'zh-CN',
    'zh-TW': 'zh-TW',
    'zh-Hans': 'zh-CN',
    'zh-Hant': 'zh-TW',

    // Japanese
    'ja': 'ja',
    'ja-JP': 'ja',

    // Korean
    'ko': 'ko',
    'ko-KR': 'ko',

    // Russian
    'ru': 'ru',
    'ru-RU': 'ru',

    // Turkish
    'tr': 'tr',
    'tr-TR': 'tr',

    // Italian
    'it': 'it',
    'it-IT': 'it',

    // Dutch
    'nl': 'nl',
    'nl-NL': 'nl',

    // Polish
    'pl': 'pl',
    'pl-PL': 'pl',

    // Vietnamese
    'vi': 'vi',
    'vi-VN': 'vi',

    // Thai
    'th': 'th',
    'th-TH': 'th',

    // Indonesian
    'id': 'id',
    'id-ID': 'id',

    // Malay
    'ms': 'ms',
    'ms-MY': 'ms',

    // Hebrew
    'he': 'he',
    'he-IL': 'he',

    // Urdu
    'ur': 'ur',
    'ur-PK': 'ur',

    // Persian/Farsi
    'fa': 'fa',
    'fa-IR': 'fa',

    // Bengali
    'bn': 'bn',
    'bn-BD': 'bn',
    'bn-IN': 'bn',

    // Tamil
    'ta': 'ta',
    'ta-IN': 'ta',

    // Telugu
    'te': 'te',
    'te-IN': 'te',

    // Marathi
    'mr': 'mr',
    'mr-IN': 'mr',

    // Gujarati
    'gu': 'gu',
    'gu-IN': 'gu',

    // Kannada
    'kn': 'kn',
    'kn-IN': 'kn',

    // Malayalam
    'ml': 'ml',
    'ml-IN': 'ml',

    // Punjabi
    'pa': 'pa',
    'pa-IN': 'pa',
};

// RTL (Right-to-Left) languages
export const RTL_LANGUAGES = ['ar', 'he', 'ur', 'fa'];

// Supported languages with labels and flags
export const SUPPORTED_LANGUAGES = {
    'en': { label: 'English', flag: '🇺🇸', rtl: false },
    'ar': { label: 'العربية', flag: '🇸🇦', rtl: true },
    'hi': { label: 'हिन्दी', flag: '🇮🇳', rtl: false },
    'es': { label: 'Español', flag: '🇪🇸', rtl: false },
    'fr': { label: 'Français', flag: '🇫🇷', rtl: false },
    'de': { label: 'Deutsch', flag: '🇩🇪', rtl: false },
    'pt': { label: 'Português', flag: '🇧🇷', rtl: false },
    'zh-CN': { label: '中文(简体)', flag: '🇨🇳', rtl: false },
    'ja': { label: '日本語', flag: '🇯🇵', rtl: false },
    'ko': { label: '한국어', flag: '🇰🇷', rtl: false },
    'ru': { label: 'Русский', flag: '🇷🇺', rtl: false },
    'tr': { label: 'Türkçe', flag: '🇹🇷', rtl: false },
    'it': { label: 'Italiano', flag: '🇮🇹', rtl: false },
    'nl': { label: 'Nederlands', flag: '🇳🇱', rtl: false },
    'vi': { label: 'Tiếng Việt', flag: '🇻🇳', rtl: false },
    'th': { label: 'ไทย', flag: '🇹🇭', rtl: false },
    'id': { label: 'Bahasa Indonesia', flag: '🇮🇩', rtl: false },
    'ms': { label: 'Bahasa Melayu', flag: '🇲🇾', rtl: false },
    'he': { label: 'עברית', flag: '🇮🇱', rtl: true },
    'ur': { label: 'اردو', flag: '🇵🇰', rtl: true },
    'fa': { label: 'فارسی', flag: '🇮🇷', rtl: true },
    'bn': { label: 'বাংলা', flag: '🇧🇩', rtl: false },
    'ta': { label: 'தமிழ்', flag: '🇮🇳', rtl: false },
    'te': { label: 'తెలుగు', flag: '🇮🇳', rtl: false },
};

/**
 * Normalize language code to Google Translate API format
 * @param {string} code - Frontend language code
 * @returns {string} - Normalized API language code
 */
export const normalizeLanguageCode = (code) => {
    if (!code) return 'en';
    return languageCodeMap[code] || code.split('-')[0] || 'en';
};

/**
 * Convert API language code back to frontend format (if needed)
 * @param {string} code - API language code
 * @returns {string} - Frontend language code
 */
export const denormalizeLanguageCode = (code) => {
    // In most cases, the normalized code can be used directly
    return code;
};

/**
 * Check if a language is RTL
 * @param {string} code - Language code
 * @returns {boolean}
 */
export const isRTL = (code) => {
    const normalized = normalizeLanguageCode(code);
    return RTL_LANGUAGES.includes(normalized);
};

/**
 * Get language info by code
 * @param {string} code - Language code
 * @returns {Object|null} - Language info object or null
 */
export const getLanguageInfo = (code) => {
    const normalized = normalizeLanguageCode(code);
    return SUPPORTED_LANGUAGES[normalized] || null;
};

/**
 * Get browser's preferred language
 * @returns {string} - Detected language code
 */
export const getBrowserLanguage = () => {
    const browserLang = navigator.language || navigator.userLanguage || 'en';
    return normalizeLanguageCode(browserLang);
};

/**
 * Get saved language from localStorage
 * @returns {string|null}
 */
export const getSavedLanguage = () => {
    try {
        return localStorage.getItem('preferred_language');
    } catch {
        return null;
    }
};

/**
 * Save language preference to localStorage
 * @param {string} code - Language code
 */
export const saveLanguagePreference = (code) => {
    try {
        localStorage.setItem('preferred_language', code);
    } catch (error) {
        console.warn('Failed to save language preference:', error);
    }
};

export default {
    languageCodeMap,
    RTL_LANGUAGES,
    SUPPORTED_LANGUAGES,
    normalizeLanguageCode,
    denormalizeLanguageCode,
    isRTL,
    getLanguageInfo,
    getBrowserLanguage,
    getSavedLanguage,
    saveLanguagePreference,
};
