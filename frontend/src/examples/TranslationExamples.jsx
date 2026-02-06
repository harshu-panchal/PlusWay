/**
 * Translation Usage Example
 * 
 * This file demonstrates how to integrate the dynamic translation system
 * with existing components. Use this as a reference for implementing
 * translations in your components.
 */

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { usePageTranslation, useTranslation } from '../hooks/usePageTranslation';
import { useDynamicTranslation } from '../hooks/useDynamicTranslation';
import { TranslatedText, TranslatedContent } from '../components/TranslatedText';
import { LanguageSelector } from '../components/LanguageSelector';

// ============================================
// EXAMPLE 1: Static Page Content Translation
// ============================================
export const ExampleStaticPage = () => {
    // Define all static texts used in this component
    const staticTexts = [
        "Welcome to our store",
        "Shop Now",
        "View Products",
        "Add to Cart",
        "Search products...",
        "No products found",
        "Try adjusting your filters",
        "Clear all filters",
        "Previous",
        "Next",
        "Filters",
        "Sort by",
        "Popularity",
        "Price: Low to High",
        "Price: High to Low",
        "Newest Arrivals",
    ];

    // Get translation function
    const { getTranslatedText, isTranslating } = usePageTranslation(staticTexts);

    // Shorthand (using `t` function)
    // const { t, isTranslating } = useTranslation(staticTexts);

    return (
        <div>
            {/* Language Selector */}
            <div className="flex justify-end p-4">
                <LanguageSelector />
            </div>

            {/* Page Content */}
            <main className="p-4">
                <h1 className="text-3xl font-bold">
                    {getTranslatedText("Welcome to our store")}
                </h1>

                <button className="bg-teal-500 text-white px-4 py-2 rounded mt-4">
                    {getTranslatedText("Shop Now")}
                </button>

                {/* Loading indicator */}
                {isTranslating && (
                    <span className="ml-2 text-sm text-gray-500">
                        Translating...
                    </span>
                )}

                {/* Sort dropdown example */}
                <div className="mt-6">
                    <label className="text-sm font-medium">
                        {getTranslatedText("Sort by")}
                    </label>
                    <select className="ml-2 border rounded px-2 py-1">
                        <option>{getTranslatedText("Popularity")}</option>
                        <option>{getTranslatedText("Price: Low to High")}</option>
                        <option>{getTranslatedText("Price: High to Low")}</option>
                        <option>{getTranslatedText("Newest Arrivals")}</option>
                    </select>
                </div>

                {/* Pagination example */}
                <div className="flex gap-2 mt-6">
                    <button className="px-4 py-2 border rounded">
                        {getTranslatedText("Previous")}
                    </button>
                    <button className="px-4 py-2 border rounded">
                        {getTranslatedText("Next")}
                    </button>
                </div>
            </main>
        </div>
    );
};

// ============================================
// EXAMPLE 2: API Response Translation
// ============================================
export const ExampleProductList = () => {
    const [products, setProducts] = useState([]);
    const [translatedProducts, setTranslatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const { translateObjectArray, isTranslating } = useDynamicTranslation();
    const { language } = useLanguage();

    // Simulated API response
    const mockProducts = [
        {
            id: 1,
            name: "Wireless Headphones",
            description: "Premium sound quality with noise cancellation",
            price: 199.99,
        },
        {
            id: 2,
            name: "Smart Watch",
            description: "Track your fitness and notifications",
            price: 299.99,
        },
        {
            id: 3,
            name: "Portable Charger",
            description: "Fast charging power bank for all devices",
            price: 49.99,
        },
    ];

    // Fetch and translate products
    useEffect(() => {
        const loadProducts = async () => {
            setLoading(true);

            // Simulate API fetch
            // const response = await fetch('/api/products');
            // const data = await response.json();
            const data = mockProducts;

            setProducts(data);

            // Translate product names and descriptions
            const translated = await translateObjectArray(
                data,
                ['name', 'description'] // Keys to translate
            );

            setTranslatedProducts(translated);
            setLoading(false);
        };

        loadProducts();
    }, [language]); // Re-translate when language changes

    if (loading) {
        return <div>Loading products...</div>;
    }

    return (
        <div className="grid grid-cols-3 gap-4 p-4">
            {translatedProducts.map(product => (
                <div key={product.id} className="border rounded-lg p-4">
                    <h3 className="font-bold text-lg">
                        {product.name}
                    </h3>
                    <p className="text-gray-600 mt-2">
                        {product.description}
                    </p>
                    <p className="text-teal-600 font-bold mt-2">
                        ${product.price}
                    </p>
                </div>
            ))}

            {isTranslating && (
                <div className="col-span-3 text-center text-gray-500">
                    Translating content...
                </div>
            )}
        </div>
    );
};

// ============================================
// EXAMPLE 3: Using TranslatedText Component
// ============================================
export const ExampleWithComponents = () => {
    return (
        <div className="p-4">
            {/* Simple text translation */}
            <TranslatedText as="h1" className="text-2xl font-bold">
                Welcome to our store
            </TranslatedText>

            <TranslatedText as="p" className="text-gray-600 mt-2">
                Find the best products at amazing prices
            </TranslatedText>

            {/* Button with translation */}
            <TranslatedText
                as="button"
                className="bg-teal-500 text-white px-4 py-2 rounded mt-4"
            >
                Shop Now
            </TranslatedText>
        </div>
    );
};

// ============================================
// EXAMPLE 4: Translating Object with Render Props
// ============================================
export const ExampleProductCard = ({ product }) => {
    return (
        <TranslatedContent
            data={product}
            keys={['name', 'description', 'category']}
            fallback={<div className="animate-pulse bg-gray-100 h-40" />}
        >
            {(translated, { isTranslating }) => (
                <div className="border rounded-lg p-4">
                    <h3 className="font-bold text-lg">
                        {translated.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                        {translated.category}
                    </p>
                    <p className="text-gray-600 mt-2">
                        {translated.description}
                    </p>
                    {isTranslating && (
                        <span className="text-xs text-gray-400">
                            Translating...
                        </span>
                    )}
                </div>
            )}
        </TranslatedContent>
    );
};

// ============================================
// EXAMPLE 5: RTL-Aware Layout
// ============================================
export const ExampleRTLLayout = () => {
    const { isRTL, language, currentLanguageInfo } = useLanguage();

    return (
        <div className={`p-4 ${isRTL ? 'text-right' : 'text-left'}`}>
            <p>Current language: {currentLanguageInfo.flag} {currentLanguageInfo.label}</p>
            <p>Direction: {isRTL ? 'RTL (Right-to-Left)' : 'LTR (Left-to-Right)'}</p>

            {/* Use CSS logical properties for RTL-aware styling */}
            <div
                style={{
                    marginInlineStart: '20px', // Auto-works with RTL
                    paddingInlineEnd: '10px',  // Auto-works with RTL
                }}
            >
                This content adjusts automatically for RTL languages!
            </div>
        </div>
    );
};

// ============================================
// EXAMPLE 6: Language Switcher in Header
// ============================================
export const ExampleHeader = () => {
    const { t } = useTranslation([
        "Home",
        "Products",
        "Cart",
        "Account",
        "Search",
    ]);

    return (
        <header className="flex items-center justify-between p-4 border-b">
            {/* Logo */}
            <div className="font-bold text-xl">Walker</div>

            {/* Navigation */}
            <nav className="flex gap-4">
                <a href="/">{t("Home")}</a>
                <a href="/products">{t("Products")}</a>
                <a href="/cart">{t("Cart")}</a>
                <a href="/account">{t("Account")}</a>
            </nav>

            {/* Language Selector */}
            <LanguageSelector compact />
        </header>
    );
};

// ============================================
// TIPS & BEST PRACTICES
// ============================================
/*

1. USE `usePageTranslation` FOR STATIC CONTENT
   - Better batching efficiency
   - Pre-translates all texts on mount
   - Use for navigation, labels, buttons, headings

2. USE `useDynamicTranslation` FOR API DATA
   - For content that comes from APIs
   - For user-generated content
   - For objects and arrays

3. CACHE IS AUTOMATIC
   - Translations are cached in IndexedDB
   - Cache persists across sessions
   - 24-hour TTL with automatic cleanup

4. RTL IS HANDLED AUTOMATICALLY
   - Document direction updates on language change
   - Use CSS logical properties for RTL-aware layouts
   - Use `isRTL` from useLanguage for conditional styling

5. FALLBACK BEHAVIOR
   - If translation fails, original text is returned
   - Same language = original text (no API call)
   - Empty/null text = empty string returned

6. PERFORMANCE TIPS
   - Group related translations in same usePageTranslation call
   - Avoid translating on every render
   - Use React.memo with translation components
   - Cache API responses before translating

*/
