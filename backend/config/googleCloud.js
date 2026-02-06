/**
 * Google Cloud Translate Configuration
 * Manages API client initialization and language code mapping
 */

const { Translate } = require('@google-cloud/translate').v2;

// Language code mapping - Maps frontend locale codes to Google Translate API codes
const languageCodeMap = {
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
const rtlLanguages = ['ar', 'he', 'ur', 'fa'];

// Supported languages with labels
const supportedLanguages = {
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
const normalizeLanguageCode = (code) => {
    if (!code) return 'en';
    return languageCodeMap[code] || code.split('-')[0] || 'en';
};

/**
 * Check if a language is RTL
 * @param {string} code - Language code
 * @returns {boolean}
 */
const isRTL = (code) => {
    const normalized = normalizeLanguageCode(code);
    return rtlLanguages.includes(normalized);
};

/**
 * Initialize Google Cloud Translate client
 */
let translateClient = null;

const initializeTranslateClient = () => {
    if (translateClient) return translateClient;

    const apiKey = process.env.GOOGLE_CLOUD_TRANSLATE_API_KEY;

    if (!apiKey) {
        console.error('❌ GOOGLE_CLOUD_TRANSLATE_API_KEY is not configured');
        return null;
    }

    try {
        translateClient = new Translate({ key: apiKey });
        console.log('✅ Google Cloud Translate client initialized');
        return translateClient;
    } catch (error) {
        console.error('❌ Failed to initialize Google Cloud Translate client:', error.message);
        return null;
    }
};

/**
 * Get the translate client instance
 * @returns {Translate|null}
 */
const getTranslateClient = () => {
    if (!translateClient) {
        return initializeTranslateClient();
    }
    return translateClient;
};

module.exports = {
    languageCodeMap,
    rtlLanguages,
    supportedLanguages,
    normalizeLanguageCode,
    isRTL,
    initializeTranslateClient,
    getTranslateClient,
};
