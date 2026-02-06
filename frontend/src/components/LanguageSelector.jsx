/**
 * LanguageSelector Component
 * Dropdown for selecting the app language with flag icons
 * 
 * @example
 * <LanguageSelector />
 * 
 * // Compact mode (icon only)
 * <LanguageSelector compact />
 * 
 * // With custom styling
 * <LanguageSelector className="custom-selector" />
 */

import React, { useState, useRef, useEffect, memo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * LanguageSelector Component
 */
export const LanguageSelector = memo(({
    compact = false,
    className = '',
    dropdownPosition = 'bottom', // 'bottom' | 'top'
    showFlags = true,
    showLabels = true,
    ...props
}) => {
    const { language, languages, changeLanguage, isChangingLanguage, isRTL } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Current language info
    const currentLang = languages[language] || { label: language, flag: '🌐' };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close dropdown on escape key
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    // Handle language selection
    const handleSelect = async (langCode) => {
        if (langCode !== language) {
            await changeLanguage(langCode);
        }
        setIsOpen(false);
    };

    return (
        <div
            ref={dropdownRef}
            className={`language-selector ${isOpen ? 'open' : ''} ${className}`}
            style={{ position: 'relative', display: 'inline-block' }}
            {...props}
        >
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                disabled={isChangingLanguage}
                className="language-selector__trigger"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-label="Select language"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: compact ? '8px' : '8px 12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    background: 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'all 0.2s',
                    minWidth: compact ? 'auto' : '120px',
                }}
            >
                {showFlags && (
                    <span style={{ fontSize: '18px' }}>{currentLang.flag}</span>
                )}
                {!compact && showLabels && (
                    <span>{currentLang.label}</span>
                )}
                {!compact && (
                    <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        style={{
                            marginLeft: 'auto',
                            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s',
                        }}
                    >
                        <path
                            d="M2 4L6 8L10 4"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                )}
                {isChangingLanguage && (
                    <span
                        style={{
                            width: '14px',
                            height: '14px',
                            border: '2px solid #e2e8f0',
                            borderTopColor: '#3b82f6',
                            borderRadius: '50%',
                            animation: 'spin 0.8s linear infinite',
                        }}
                    />
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div
                    className="language-selector__dropdown"
                    role="listbox"
                    style={{
                        position: 'absolute',
                        [dropdownPosition === 'top' ? 'bottom' : 'top']: '100%',
                        [isRTL ? 'right' : 'left']: 0,
                        marginTop: dropdownPosition === 'bottom' ? '4px' : 0,
                        marginBottom: dropdownPosition === 'top' ? '4px' : 0,
                        minWidth: '180px',
                        maxHeight: '300px',
                        overflowY: 'auto',
                        background: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        zIndex: 1000,
                    }}
                >
                    {Object.entries(languages).map(([code, info]) => (
                        <button
                            key={code}
                            type="button"
                            role="option"
                            aria-selected={code === language}
                            onClick={() => handleSelect(code)}
                            className={`language-selector__option ${code === language ? 'selected' : ''}`}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                width: '100%',
                                padding: '10px 14px',
                                border: 'none',
                                background: code === language ? '#f0f9ff' : 'transparent',
                                cursor: 'pointer',
                                fontSize: '14px',
                                textAlign: isRTL ? 'right' : 'left',
                                direction: info.rtl ? 'rtl' : 'ltr',
                                transition: 'background 0.15s',
                            }}
                            onMouseEnter={(e) => {
                                if (code !== language) {
                                    e.currentTarget.style.background = '#f8fafc';
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = code === language ? '#f0f9ff' : 'transparent';
                            }}
                        >
                            {showFlags && (
                                <span style={{ fontSize: '18px' }}>{info.flag}</span>
                            )}
                            <span style={{ flex: 1 }}>{info.label}</span>
                            {code === language && (
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path
                                        d="M13.3332 4L5.99984 11.3333L2.6665 8"
                                        stroke="#3b82f6"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            )}
                        </button>
                    ))}
                </div>
            )}

            {/* Inline styles for animation */}
            <style>
                {`
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                    
                    .language-selector__trigger:hover:not(:disabled) {
                        border-color: #3b82f6;
                        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                    }
                    
                    .language-selector__trigger:focus {
                        outline: none;
                        border-color: #3b82f6;
                        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
                    }
                    
                    .language-selector__option:first-child {
                        border-radius: 7px 7px 0 0;
                    }
                    
                    .language-selector__option:last-child {
                        border-radius: 0 0 7px 7px;
                    }
                    
                    .language-selector__dropdown::-webkit-scrollbar {
                        width: 6px;
                    }
                    
                    .language-selector__dropdown::-webkit-scrollbar-track {
                        background: #f1f5f9;
                        border-radius: 3px;
                    }
                    
                    .language-selector__dropdown::-webkit-scrollbar-thumb {
                        background: #cbd5e1;
                        border-radius: 3px;
                    }
                    
                    .language-selector__dropdown::-webkit-scrollbar-thumb:hover {
                        background: #94a3b8;
                    }
                `}
            </style>
        </div>
    );
});

LanguageSelector.displayName = 'LanguageSelector';

/**
 * Simple Select Version (for mobile/forms)
 */
export const LanguageSelect = memo(({
    className = '',
    showFlags = true,
    ...props
}) => {
    const { language, languages, changeLanguage, isChangingLanguage } = useLanguage();

    return (
        <select
            value={language}
            onChange={(e) => changeLanguage(e.target.value)}
            disabled={isChangingLanguage}
            className={`language-select ${className}`}
            aria-label="Select language"
            style={{
                padding: '8px 12px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                background: 'white',
                fontSize: '14px',
                cursor: 'pointer',
            }}
            {...props}
        >
            {Object.entries(languages).map(([code, info]) => (
                <option key={code} value={code}>
                    {showFlags ? `${info.flag} ${info.label}` : info.label}
                </option>
            ))}
        </select>
    );
});

LanguageSelect.displayName = 'LanguageSelect';

export default LanguageSelector;
