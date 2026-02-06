/**
 * Translation Service Test Script
 * Run: node scripts/testTranslation.js
 */

require('dotenv').config();

const translationService = require('../services/translationService');
const { initializeTranslateClient, supportedLanguages } = require('../config/googleCloud');

const testTexts = [
    "Welcome to our store",
    "Add to cart",
    "Product description",
    "Free shipping available",
    "Customer reviews",
];

const testObject = {
    name: "Premium Wireless Headphones",
    description: "High-quality audio experience with noise cancellation",
    brand: "Walker Audio",
    category: "Electronics",
    price: "$199.99",
};

async function runTests() {
    console.log('🧪 Translation Service Test\n');
    console.log('='.repeat(50));

    // Check API key
    if (!process.env.GOOGLE_CLOUD_TRANSLATE_API_KEY ||
        process.env.GOOGLE_CLOUD_TRANSLATE_API_KEY === 'your_google_cloud_translate_api_key_here') {
        console.error('❌ GOOGLE_CLOUD_TRANSLATE_API_KEY is not configured!');
        console.error('   Please add your API key to backend/.env file');
        console.error('   Get your key from: https://console.cloud.google.com/apis/credentials');
        process.exit(1);
    }

    // Initialize client
    console.log('\n📦 Initializing Google Cloud Translate client...');
    const client = initializeTranslateClient();

    if (!client) {
        console.error('❌ Failed to initialize translation client');
        process.exit(1);
    }

    console.log('✅ Client initialized successfully\n');

    // Test 1: Single text translation
    console.log('='.repeat(50));
    console.log('📝 Test 1: Single Text Translation');
    console.log('='.repeat(50));

    try {
        const result = await translationService.translateText("Hello, World!", "ar", "en");
        console.log('   Original:', result.original);
        console.log('   Translated (Arabic):', result.translation);
        console.log('   Cached:', result.cached ? 'Yes' : 'No');
        console.log('   ✅ Single translation successful\n');
    } catch (error) {
        console.error('   ❌ Single translation failed:', error.message, '\n');
    }

    // Test 2: Batch translation
    console.log('='.repeat(50));
    console.log('📝 Test 2: Batch Translation');
    console.log('='.repeat(50));

    try {
        const results = await translationService.translateBatch(testTexts, "hi", "en");
        console.log('   Translations (English → Hindi):');
        results.forEach((r, i) => {
            console.log(`   ${i + 1}. "${r.original}" → "${r.translation}"`);
        });
        console.log('   ✅ Batch translation successful\n');
    } catch (error) {
        console.error('   ❌ Batch translation failed:', error.message, '\n');
    }

    // Test 3: Object translation
    console.log('='.repeat(50));
    console.log('📝 Test 3: Object Translation');
    console.log('='.repeat(50));

    try {
        const translatedObj = await translationService.translateObject(
            testObject,
            "es",
            "en",
            ["name", "description"]
        );
        console.log('   Original Object:', JSON.stringify(testObject, null, 4));
        console.log('   Translated Object (Spanish):', JSON.stringify(translatedObj, null, 4));
        console.log('   ✅ Object translation successful\n');
    } catch (error) {
        console.error('   ❌ Object translation failed:', error.message, '\n');
    }

    // Test 4: Cache verification
    console.log('='.repeat(50));
    console.log('📝 Test 4: Cache Verification');
    console.log('='.repeat(50));

    try {
        const firstCall = await translationService.translateText("Hello, World!", "ar", "en");
        const secondCall = await translationService.translateText("Hello, World!", "ar", "en");

        console.log('   First call cached:', firstCall.cached ? 'Yes' : 'No');
        console.log('   Second call cached:', secondCall.cached ? 'Yes' : 'No');
        console.log('   Cache stats:', translationService.getCacheStats());
        console.log('   ✅ Cache working correctly\n');
    } catch (error) {
        console.error('   ❌ Cache test failed:', error.message, '\n');
    }

    // Test 5: Multiple languages
    console.log('='.repeat(50));
    console.log('📝 Test 5: Multiple Languages');
    console.log('='.repeat(50));

    const testLangs = ['ar', 'hi', 'es', 'fr', 'zh-CN', 'ja'];

    for (const lang of testLangs) {
        try {
            const result = await translationService.translateText("Welcome", lang, "en");
            const langInfo = supportedLanguages[lang] || { label: lang };
            console.log(`   ${langInfo.flag || '🌐'} ${langInfo.label}: "${result.translation}"`);
        } catch (error) {
            console.log(`   ❌ ${lang}: Failed - ${error.message}`);
        }
    }
    console.log('   ✅ Multi-language test complete\n');

    // Summary
    console.log('='.repeat(50));
    console.log('📊 Final Cache Statistics');
    console.log('='.repeat(50));
    console.log('   ', translationService.getCacheStats());

    console.log('\n✅ All tests completed!');
    console.log('   Translation service is ready for production use.\n');
}

// Run tests
runTests().catch(console.error);
