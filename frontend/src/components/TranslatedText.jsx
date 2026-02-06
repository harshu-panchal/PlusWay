/**
 * TranslatedText Component
 * Wrapper component for automatic text translation
 * 
 * @example
 * // Basic usage
 * <TranslatedText>Hello World</TranslatedText>
 * 
 * // With custom element
 * <TranslatedText as="h1" className="title">
 *   Welcome to our store
 * </TranslatedText>
 * 
 * // With loading placeholder
 * <TranslatedText loadingText="...">
 *   Loading content
 * </TranslatedText>
 */

import React, { useState, useEffect, memo } from 'react';
import { translateText } from '../services/translationService';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * TranslatedText Component
 * Automatically translates children text content
 */
export const TranslatedText = memo(({
    children,
    as: Component = 'span',
    sourceLang = 'en',
    loadingText = null,
    showOriginalWhileLoading = true,
    className = '',
    style = {},
    ...props
}) => {
    const { language } = useLanguage();
    const [translatedContent, setTranslatedContent] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Extract text from children
    const originalText = typeof children === 'string'
        ? children
        : React.Children.toArray(children).join('');

    useEffect(() => {
        let isMounted = true;

        const performTranslation = async () => {
            // Skip if no text or same language
            if (!originalText || !originalText.trim() || language === sourceLang) {
                if (isMounted) {
                    setTranslatedContent(originalText);
                    setIsLoading(false);
                }
                return;
            }

            setIsLoading(true);

            try {
                const translated = await translateText(originalText, language, sourceLang);

                if (isMounted) {
                    setTranslatedContent(translated);
                }
            } catch (error) {
                console.error('TranslatedText error:', error);
                if (isMounted) {
                    setTranslatedContent(originalText);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        performTranslation();

        return () => {
            isMounted = false;
        };
    }, [originalText, language, sourceLang]);

    // Determine what to render
    let content;

    if (isLoading) {
        if (loadingText !== null) {
            content = loadingText;
        } else if (showOriginalWhileLoading) {
            content = originalText;
        } else {
            content = '';
        }
    } else {
        content = translatedContent ?? originalText;
    }

    return (
        <Component
            className={`translated-text ${isLoading ? 'translating' : ''} ${className}`}
            style={style}
            {...props}
        >
            {content}
        </Component>
    );
});

TranslatedText.displayName = 'TranslatedText';

/**
 * AutoTranslated Component
 * Wraps content and auto-translates all text nodes
 * 
 * @example
 * <AutoTranslated>
 *   <div>
 *     <h1>Title</h1>
 *     <p>This paragraph will be translated</p>
 *   </div>
 * </AutoTranslated>
 */
export const AutoTranslated = memo(({
    children,
    sourceLang = 'en',
    ...props
}) => {
    const { language } = useLanguage();
    const [translatedChildren, setTranslatedChildren] = useState(children);
    const [isTranslating, setIsTranslating] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const translateNode = async (node) => {
            if (typeof node === 'string') {
                if (!node.trim() || language === sourceLang) {
                    return node;
                }
                return await translateText(node, language, sourceLang);
            }

            if (React.isValidElement(node)) {
                const children = node.props.children;

                if (children) {
                    const translatedChildren = await translateChildren(children);
                    return React.cloneElement(node, {}, translatedChildren);
                }

                return node;
            }

            return node;
        };

        const translateChildren = async (children) => {
            if (!children) return children;

            const childArray = React.Children.toArray(children);
            const translatedArray = await Promise.all(
                childArray.map(child => translateNode(child))
            );

            return translatedArray;
        };

        const performTranslation = async () => {
            if (language === sourceLang) {
                if (isMounted) {
                    setTranslatedChildren(children);
                    setIsTranslating(false);
                }
                return;
            }

            setIsTranslating(true);

            try {
                const translated = await translateChildren(children);

                if (isMounted) {
                    setTranslatedChildren(translated);
                }
            } catch (error) {
                console.error('AutoTranslated error:', error);
                if (isMounted) {
                    setTranslatedChildren(children);
                }
            } finally {
                if (isMounted) {
                    setIsTranslating(false);
                }
            }
        };

        performTranslation();

        return () => {
            isMounted = false;
        };
    }, [children, language, sourceLang]);

    return (
        <div
            className={`auto-translated ${isTranslating ? 'translating' : ''}`}
            {...props}
        >
            {translatedChildren}
        </div>
    );
});

AutoTranslated.displayName = 'AutoTranslated';

/**
 * TranslatedContent Component
 * For translating objects with specific keys
 * 
 * @example
 * const product = { name: "Phone", description: "A great phone" };
 * 
 * <TranslatedContent 
 *   data={product} 
 *   keys={['name', 'description']}
 * >
 *   {(translated) => (
 *     <div>
 *       <h2>{translated.name}</h2>
 *       <p>{translated.description}</p>
 *     </div>
 *   )}
 * </TranslatedContent>
 */
export const TranslatedContent = memo(({
    data,
    keys = [],
    children,
    sourceLang = 'en',
    fallback = null,
}) => {
    const { language } = useLanguage();
    const [translatedData, setTranslatedData] = useState(data);
    const [isTranslating, setIsTranslating] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const translateData = async () => {
            if (!data || language === sourceLang) {
                if (isMounted) {
                    setTranslatedData(data);
                    setIsTranslating(false);
                }
                return;
            }

            setIsTranslating(true);

            try {
                // Import dynamically to avoid circular deps
                const { translateObject } = await import('../services/translationService');
                const translated = await translateObject(data, keys, language, sourceLang);

                if (isMounted) {
                    setTranslatedData(translated);
                }
            } catch (error) {
                console.error('TranslatedContent error:', error);
                if (isMounted) {
                    setTranslatedData(data);
                }
            } finally {
                if (isMounted) {
                    setIsTranslating(false);
                }
            }
        };

        translateData();

        return () => {
            isMounted = false;
        };
    }, [data, keys, language, sourceLang]);

    if (isTranslating && fallback) {
        return fallback;
    }

    if (typeof children === 'function') {
        return children(translatedData, { isTranslating });
    }

    return null;
});

TranslatedContent.displayName = 'TranslatedContent';

export default TranslatedText;
