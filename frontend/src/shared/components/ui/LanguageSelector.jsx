import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';

const LanguageSelector = () => {
    const { language, languages, changeLanguage, currentLanguageInfo, isChangingLanguage } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

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

    const handleLanguageChange = (code) => {
        changeLanguage(code);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-all duration-200 ${isOpen
                        ? 'bg-slate-800 text-white'
                        : 'hover:bg-slate-800/50 text-slate-400 hover:text-white'
                    }`}
                disabled={isChangingLanguage}
            >
                <div className="flex items-center space-x-2">
                    <span className="text-sm scale-110">{currentLanguageInfo?.flag}</span>
                    <span className="text-[10px] font-bold tracking-widest uppercase hidden sm:inline">
                        {language}
                    </span>
                </div>
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-[60] animate-in fade-in zoom-in duration-200">
                    <div className="py-2 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
                        {Object.entries(languages).map(([code, info]) => (
                            <button
                                key={code}
                                onClick={() => handleLanguageChange(code)}
                                className={`w-full flex items-center justify-between px-4 py-2.5 text-xs transition-colors ${language === code
                                        ? 'bg-teal-500/10 text-teal-400'
                                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                    }`}
                            >
                                <div className="flex items-center space-x-3">
                                    <span className="text-base">{info.flag}</span>
                                    <span className="font-semibold">{info.label}</span>
                                </div>
                                {language === code && <Check className="w-3.5 h-3.5" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {isChangingLanguage && (
                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-500 animate-progress"></div>
                </div>
            )}
        </div>
    );
};

export default LanguageSelector;
