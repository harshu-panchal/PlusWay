# 🌐 Dynamic Translation System - Documentation

## Overview

This document provides comprehensive guidance for the **Dynamic Translation System** implemented in the Walker E-commerce project. The system enables real-time translation of all content (static UI text and dynamic API data) using Google Cloud Translate API.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Backend Setup](#backend-setup)
3. [Frontend Usage](#frontend-usage)
4. [API Reference](#api-reference)
5. [React Hooks Reference](#react-hooks-reference)
6. [Components Reference](#components-reference)
7. [Language Configuration](#language-configuration)
8. [Caching Strategy](#caching-strategy)
9. [RTL Support](#rtl-support)
10. [Testing](#testing)
11. [Troubleshooting](#troubleshooting)

---

## Quick Start

### 1. Configure Google Cloud Translate API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Enable [Cloud Translation API](https://console.cloud.google.com/apis/library/translate.googleapis.com)
4. Create an API Key: APIs & Services > Credentials > Create Credentials > API Key
5. (Recommended) Restrict the API key to Cloud Translation API only
6. Add to `backend/.env`:

```env
GOOGLE_CLOUD_TRANSLATE_API_KEY=your_actual_api_key_here
```

### 2. Start the Application

```bash
# Backend
cd backend
npm install
npm start

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

### 3. Test Translation

```bash
cd backend
node scripts/testTranslation.js
```

---

## Backend Setup

### Files Structure

```
backend/
├── config/
│   └── googleCloud.js          # Google Cloud Translate configuration
├── services/
│   └── translationService.js   # Core translation logic
├── controllers/
│   └── translationController.js # HTTP request handlers
├── routes/
│   └── translationRoutes.js    # API endpoints
└── scripts/
    └── testTranslation.js      # Test script
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GOOGLE_CLOUD_TRANSLATE_API_KEY` | Google Cloud Translate API Key | Yes |

### API Endpoints

All endpoints are **public** (no authentication required):

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/translate` | Translate single text |
| POST | `/api/translate/batch` | Translate multiple texts (max 100) |
| POST | `/api/translate/object` | Translate object properties |
| GET | `/api/translate/languages` | Get supported languages |
| GET | `/api/translate/stats` | Get cache statistics |
| GET | `/api/translate/rtl/:lang` | Check if language is RTL |

---

## Frontend Usage

### Files Structure

```
frontend/src/
├── contexts/
│   └── LanguageContext.jsx     # Global language state
├── hooks/
│   ├── useDynamicTranslation.jsx  # For API/dynamic content
│   └── usePageTranslation.jsx     # For static page content
├── components/
│   ├── TranslatedText.jsx      # Translation wrapper components
│   └── LanguageSelector.jsx    # Language dropdown UI
├── services/
│   └── translationService.js   # API client with caching
└── shared/utils/
    ├── languageUtils.js        # Language utilities
    └── translationCache.js     # IndexedDB/localStorage caching
```

---

## API Reference

### POST /api/translate

Translate a single text string.

**Request Body:**
```json
{
  "text": "Hello World",
  "targetLang": "ar",
  "sourceLang": "en"  // optional, default: "en"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "original": "Hello World",
    "translation": "مرحبا بالعالم",
    "sourceLang": "en",
    "targetLang": "ar"
  }
}
```

### POST /api/translate/batch

Translate multiple texts in batch (max 100).

**Request Body:**
```json
{
  "texts": ["Hello", "World", "Welcome"],
  "targetLang": "es",
  "sourceLang": "en"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "translations": [
      { "original": "Hello", "translation": "Hola", "sourceLang": "en", "targetLang": "es" },
      { "original": "World", "translation": "Mundo", "sourceLang": "en", "targetLang": "es" },
      { "original": "Welcome", "translation": "Bienvenido", "sourceLang": "en", "targetLang": "es" }
    ],
    "count": 3,
    "sourceLang": "en",
    "targetLang": "es"
  }
}
```

### POST /api/translate/object

Translate specific object properties.

**Request Body:**
```json
{
  "object": {
    "name": "Premium Headphones",
    "description": "High-quality audio experience",
    "price": "$199.99"
  },
  "keys": ["name", "description"],
  "targetLang": "fr",
  "sourceLang": "en"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "original": { ... },
    "translated": {
      "name": "Écouteurs Premium",
      "description": "Expérience audio de haute qualité",
      "price": "$199.99"
    },
    "sourceLang": "en",
    "targetLang": "fr"
  }
}
```

---

## React Hooks Reference

### useLanguage

Access global language state and controls.

```jsx
import { useLanguage } from '../contexts/LanguageContext';

function MyComponent() {
  const { 
    language,           // Current language code: "en", "ar", etc.
    languages,          // All supported languages object
    isRTL,              // Boolean: is current language RTL?
    isChangingLanguage, // Boolean: is language changing?
    changeLanguage,     // Function: (langCode) => Promise<void>
    currentLanguageInfo // Object: { label, flag, rtl }
  } = useLanguage();
  
  return (
    <button onClick={() => changeLanguage('ar')}>
      Switch to Arabic
    </button>
  );
}
```

### useDynamicTranslation

For translating API responses and dynamic content.

```jsx
import { useDynamicTranslation } from '../hooks/useDynamicTranslation';

function ProductList({ products }) {
  const { translate, translateBatch, translateObject, isTranslating } = useDynamicTranslation();
  
  // Single text
  const translated = await translate("Hello World");
  
  // Batch texts
  const translations = await translateBatch(["Hello", "World"]);
  
  // Object translation
  const translatedProduct = await translateObject(
    product, 
    ['name', 'description']
  );
  
  // Array of objects
  const translatedProducts = await translateObjectArray(
    products,
    ['name', 'description']
  );
}
```

### usePageTranslation

For static page content with optimized batching.

```jsx
import { usePageTranslation } from '../hooks/usePageTranslation';

function HomePage() {
  const staticTexts = [
    "Welcome to our store",
    "Shop Now",
    "View Products",
    "Contact Us"
  ];
  
  const { getTranslatedText, isTranslating } = usePageTranslation(staticTexts);
  
  return (
    <div>
      <h1>{getTranslatedText("Welcome to our store")}</h1>
      <button>{getTranslatedText("Shop Now")}</button>
      {isTranslating && <span>Loading translations...</span>}
    </div>
  );
}
```

### useTranslation (Shorthand)

Shorter alias with `t()` function.

```jsx
import { useTranslation } from '../hooks/usePageTranslation';

function NavBar() {
  const { t } = useTranslation(["Home", "Products", "Cart", "Account"]);
  
  return (
    <nav>
      <a href="/">{t("Home")}</a>
      <a href="/products">{t("Products")}</a>
      <a href="/cart">{t("Cart")}</a>
    </nav>
  );
}
```

---

## Components Reference

### TranslatedText

Wrapper for automatic text translation.

```jsx
import { TranslatedText } from '../components/TranslatedText';

// Basic usage
<TranslatedText>Hello World</TranslatedText>

// Custom element
<TranslatedText as="h1" className="title">
  Welcome to our store
</TranslatedText>

// With loading placeholder
<TranslatedText loadingText="...">
  Loading content
</TranslatedText>
```

### TranslatedContent

For translating objects with render props.

```jsx
import { TranslatedContent } from '../components/TranslatedText';

const product = {
  name: "Premium Headphones",
  description: "High-quality audio experience"
};

<TranslatedContent 
  data={product} 
  keys={['name', 'description']}
>
  {(translated, { isTranslating }) => (
    <div>
      <h2>{translated.name}</h2>
      <p>{translated.description}</p>
    </div>
  )}
</TranslatedContent>
```

### LanguageSelector

Dropdown for language selection.

```jsx
import { LanguageSelector, LanguageSelect } from '../components/LanguageSelector';

// Full dropdown with flags
<LanguageSelector />

// Compact mode (icon only)
<LanguageSelector compact />

// Simple select (for forms/mobile)
<LanguageSelect />
```

---

## Language Configuration

### Supported Languages

The system supports 24 languages by default. To modify supported languages:

**Frontend:** `src/shared/utils/languageUtils.js`
**Backend:** `backend/config/googleCloud.js`

```javascript
export const SUPPORTED_LANGUAGES = {
  'en': { label: 'English', flag: '🇺🇸', rtl: false },
  'ar': { label: 'العربية', flag: '🇸🇦', rtl: true },
  'hi': { label: 'हिन्दी', flag: '🇮🇳', rtl: false },
  // Add more languages as needed
};
```

### Adding a New Language

1. Add to `SUPPORTED_LANGUAGES` in both files
2. Add language code mapping if needed in `languageCodeMap`
3. If RTL language, add to `RTL_LANGUAGES` array

---

## Caching Strategy

### Multi-Layer Cache

1. **IndexedDB (Primary)**: 50MB limit, 24-hour TTL
2. **localStorage (Fallback)**: Used if IndexedDB unavailable
3. **Backend In-Memory**: 24-hour TTL, auto-cleanup hourly

### Cache Key Format

```
{sourceLang}_{targetLang}_{base64(text)}
```

### Cache Behavior

- **Never cache** translations where `translation === original` (indicates failure)
- **Auto-cleanup** expired entries every hour
- **Cache-first** strategy on all requests

---

## RTL Support

The system automatically detects RTL languages and:

1. Sets `document.documentElement.dir = "rtl"`
2. Sets `document.documentElement.lang` attribute
3. Adds `rtl` or `ltr` class to `<body>`

### RTL Languages

- Arabic (`ar`)
- Hebrew (`he`)
- Urdu (`ur`)
- Persian/Farsi (`fa`)

### CSS RTL Styling

```css
/* Target RTL layouts */
body.rtl {
  direction: rtl;
  text-align: right;
}

body.rtl .flex-row {
  flex-direction: row-reverse;
}

/* Use logical properties for automatic RTL support */
.element {
  margin-inline-start: 10px;  /* auto-works with RTL */
  padding-inline-end: 20px;
}
```

---

## Testing

### Run Backend Test Script

```bash
cd backend
node scripts/testTranslation.js
```

### Test API Endpoints

```bash
# Single translation
curl -X POST http://localhost:5000/api/translate \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello World","targetLang":"ar"}'

# Batch translation
curl -X POST http://localhost:5000/api/translate/batch \
  -H "Content-Type: application/json" \
  -d '{"texts":["Hello","World"],"targetLang":"es"}'

# Get supported languages
curl http://localhost:5000/api/translate/languages
```

---

## Troubleshooting

### Common Issues

#### 1. "Translation service unavailable"

**Cause:** API key not configured or invalid.

**Solution:**
- Verify `GOOGLE_CLOUD_TRANSLATE_API_KEY` in `.env`
- Check Google Cloud Console for API quota
- Ensure Translation API is enabled

#### 2. Translations returning original text

**Cause:** Same source/target language or API failure.

**Solution:**
- Check language codes are different
- Verify API key permissions
- Check backend logs for errors

#### 3. RTL not working

**Cause:** LanguageProvider not wrapped correctly.

**Solution:**
- Ensure `LanguageProvider` wraps your app in `main.jsx`
- Check that `useLanguage` is called inside the provider

#### 4. Cache not working

**Cause:** IndexedDB blocked or storage full.

**Solution:**
- Check browser settings for IndexedDB
- Clear old cache: `localStorage.clear()` or use browser DevTools
- Verify HTTPS in production (required for IndexedDB)

### Debug Mode

Enable console logging for debugging:

```javascript
// Add to translationService.js for debugging
const DEBUG = true;

const log = (...args) => {
  if (DEBUG) console.log('[Translation]', ...args);
};
```

---

## Performance Targets

| Metric | Target |
|--------|--------|
| Cache Hit Rate | 70-80% after initial load |
| API Call Reduction | 85%+ through batching |
| Cached Translation Latency | <10ms |
| First-time Translation Latency | 100-300ms |
| Batch Translation (10 items) | ~500ms |
| IndexedDB Storage | <50MB |

---

## Security Considerations

1. **API Key Protection**: Keep API key on backend only
2. **Rate Limiting**: Built-in with 200ms minimum between requests
3. **Input Validation**: All inputs validated before translation
4. **CORS**: Translation endpoints follow app CORS policy

---

## Production Deployment

### Environment Variables (Production)

```env
GOOGLE_CLOUD_TRANSLATE_API_KEY=your_production_api_key
```

### API Key Restrictions (Recommended)

1. Go to Google Cloud Console > APIs & Services > Credentials
2. Edit your API key
3. Under "API restrictions", select "Cloud Translation API"
4. Under "Application restrictions", add your backend server IP

---

## Support

For issues or feature requests, check the project documentation or contact the development team.
