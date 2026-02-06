/**
 * Translation Cache Utility
 * Multi-layer caching using IndexedDB (primary) and localStorage (fallback)
 */

const DB_NAME = 'TranslationCache';
const DB_VERSION = 1;
const STORE_NAME = 'translations';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
const MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB limit
const CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour

let db = null;
let dbPromise = null;
let useIndexedDB = true;

/**
 * Initialize IndexedDB
 * @returns {Promise<IDBDatabase|null>}
 */
const initDB = () => {
    if (dbPromise) return dbPromise;

    dbPromise = new Promise((resolve, reject) => {
        if (!window.indexedDB) {
            console.warn('IndexedDB not supported, falling back to localStorage');
            useIndexedDB = false;
            resolve(null);
            return;
        }

        try {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = (event) => {
                console.warn('IndexedDB error, falling back to localStorage:', event.target.error);
                useIndexedDB = false;
                resolve(null);
            };

            request.onsuccess = (event) => {
                db = event.target.result;
                console.log('✅ Translation cache initialized (IndexedDB)');
                resolve(db);
            };

            request.onupgradeneeded = (event) => {
                const database = event.target.result;

                if (!database.objectStoreNames.contains(STORE_NAME)) {
                    const store = database.createObjectStore(STORE_NAME, { keyPath: 'key' });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                    store.createIndex('targetLang', 'targetLang', { unique: false });
                }
            };
        } catch (error) {
            console.warn('IndexedDB initialization failed:', error);
            useIndexedDB = false;
            resolve(null);
        }
    });

    return dbPromise;
};

/**
 * Generate cache key
 * @param {string} text - Original text
 * @param {string} sourceLang - Source language
 * @param {string} targetLang - Target language
 * @returns {string}
 */
export const generateCacheKey = (text, sourceLang, targetLang) => {
    const base64Text = btoa(unescape(encodeURIComponent(text)));
    return `${sourceLang}_${targetLang}_${base64Text}`;
};

/**
 * Get translation from cache
 * @param {string} key - Cache key
 * @returns {Promise<string|null>}
 */
export const getFromCache = async (key) => {
    await initDB();

    if (useIndexedDB && db) {
        return new Promise((resolve) => {
            try {
                const transaction = db.transaction([STORE_NAME], 'readonly');
                const store = transaction.objectStore(STORE_NAME);
                const request = store.get(key);

                request.onsuccess = (event) => {
                    const result = event.target.result;

                    if (!result) {
                        resolve(null);
                        return;
                    }

                    // Check if expired
                    if (Date.now() - result.timestamp > CACHE_TTL) {
                        // Clean up expired entry
                        deleteFromCache(key);
                        resolve(null);
                        return;
                    }

                    // Don't return if translation equals original
                    if (result.translation === result.original) {
                        resolve(null);
                        return;
                    }

                    resolve(result.translation);
                };

                request.onerror = () => {
                    resolve(null);
                };
            } catch (error) {
                console.warn('Cache get error:', error);
                resolve(null);
            }
        });
    }

    // Fallback to localStorage
    return getFromLocalStorage(key);
};

/**
 * Get from localStorage fallback
 * @param {string} key - Cache key
 * @returns {string|null}
 */
const getFromLocalStorage = (key) => {
    try {
        const stored = localStorage.getItem(`tc_${key}`);
        if (!stored) return null;

        const parsed = JSON.parse(stored);

        // Check if expired
        if (Date.now() - parsed.timestamp > CACHE_TTL) {
            localStorage.removeItem(`tc_${key}`);
            return null;
        }

        // Don't return if translation equals original
        if (parsed.translation === parsed.original) {
            return null;
        }

        return parsed.translation;
    } catch (error) {
        return null;
    }
};

/**
 * Set translation in cache
 * @param {string} key - Cache key
 * @param {string} original - Original text
 * @param {string} translation - Translated text
 * @param {string} sourceLang - Source language
 * @param {string} targetLang - Target language
 * @returns {Promise<void>}
 */
export const setInCache = async (key, original, translation, sourceLang, targetLang) => {
    // Don't cache if translation equals original
    if (translation === original) {
        return;
    }

    await initDB();

    const entry = {
        key,
        original,
        translation,
        sourceLang,
        targetLang,
        timestamp: Date.now(),
    };

    if (useIndexedDB && db) {
        return new Promise((resolve) => {
            try {
                const transaction = db.transaction([STORE_NAME], 'readwrite');
                const store = transaction.objectStore(STORE_NAME);
                store.put(entry);

                transaction.oncomplete = () => resolve();
                transaction.onerror = () => {
                    // Fallback to localStorage
                    setInLocalStorage(key, entry);
                    resolve();
                };
            } catch (error) {
                setInLocalStorage(key, entry);
                resolve();
            }
        });
    }

    // Fallback to localStorage
    setInLocalStorage(key, entry);
};

/**
 * Set in localStorage fallback
 * @param {string} key - Cache key
 * @param {Object} entry - Cache entry
 */
const setInLocalStorage = (key, entry) => {
    try {
        localStorage.setItem(`tc_${key}`, JSON.stringify(entry));
    } catch (error) {
        console.warn('localStorage cache error:', error);
        // Storage might be full, try to clean up old entries
        cleanupLocalStorage();
    }
};

/**
 * Delete from cache
 * @param {string} key - Cache key
 * @returns {Promise<void>}
 */
export const deleteFromCache = async (key) => {
    if (useIndexedDB && db) {
        return new Promise((resolve) => {
            try {
                const transaction = db.transaction([STORE_NAME], 'readwrite');
                const store = transaction.objectStore(STORE_NAME);
                store.delete(key);
                transaction.oncomplete = () => resolve();
                transaction.onerror = () => resolve();
            } catch {
                resolve();
            }
        });
    }

    try {
        localStorage.removeItem(`tc_${key}`);
    } catch { }
};

/**
 * Cleanup expired entries from IndexedDB
 * @returns {Promise<number>} - Number of entries deleted
 */
export const cleanupExpiredEntries = async () => {
    await initDB();

    if (!useIndexedDB || !db) {
        cleanupLocalStorage();
        return 0;
    }

    return new Promise((resolve) => {
        try {
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const index = store.index('timestamp');
            const cutoff = Date.now() - CACHE_TTL;
            const range = IDBKeyRange.upperBound(cutoff);

            let deleted = 0;
            const request = index.openCursor(range);

            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    store.delete(cursor.primaryKey);
                    deleted++;
                    cursor.continue();
                }
            };

            transaction.oncomplete = () => {
                console.log(`🧹 Cleaned up ${deleted} expired cache entries`);
                resolve(deleted);
            };

            transaction.onerror = () => resolve(0);
        } catch (error) {
            console.warn('Cleanup error:', error);
            resolve(0);
        }
    });
};

/**
 * Cleanup localStorage translation cache entries
 */
const cleanupLocalStorage = () => {
    try {
        const keysToRemove = [];
        const now = Date.now();

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith('tc_')) {
                try {
                    const stored = JSON.parse(localStorage.getItem(key));
                    if (now - stored.timestamp > CACHE_TTL) {
                        keysToRemove.push(key);
                    }
                } catch {
                    keysToRemove.push(key);
                }
            }
        }

        keysToRemove.forEach(key => localStorage.removeItem(key));
        console.log(`🧹 Cleaned up ${keysToRemove.length} localStorage cache entries`);
    } catch (error) {
        console.warn('localStorage cleanup error:', error);
    }
};

/**
 * Get cache statistics
 * @returns {Promise<Object>}
 */
export const getCacheStats = async () => {
    await initDB();

    if (!useIndexedDB || !db) {
        return {
            type: 'localStorage',
            entries: countLocalStorageEntries(),
        };
    }

    return new Promise((resolve) => {
        try {
            const transaction = db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const countRequest = store.count();

            countRequest.onsuccess = () => {
                resolve({
                    type: 'IndexedDB',
                    entries: countRequest.result,
                });
            };

            countRequest.onerror = () => {
                resolve({ type: 'IndexedDB', entries: 0 });
            };
        } catch {
            resolve({ type: 'IndexedDB', entries: 0 });
        }
    });
};

/**
 * Count localStorage translation entries
 * @returns {number}
 */
const countLocalStorageEntries = () => {
    try {
        let count = 0;
        for (let i = 0; i < localStorage.length; i++) {
            if (localStorage.key(i)?.startsWith('tc_')) {
                count++;
            }
        }
        return count;
    } catch {
        return 0;
    }
};

/**
 * Clear all cache entries
 * @returns {Promise<void>}
 */
export const clearCache = async () => {
    if (useIndexedDB && db) {
        return new Promise((resolve) => {
            try {
                const transaction = db.transaction([STORE_NAME], 'readwrite');
                const store = transaction.objectStore(STORE_NAME);
                store.clear();
                transaction.oncomplete = () => {
                    console.log('🗑️ Translation cache cleared');
                    resolve();
                };
                transaction.onerror = () => resolve();
            } catch {
                resolve();
            }
        });
    }

    // Clear localStorage entries
    try {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith('tc_')) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch { }
};

// Initialize cache on import
initDB();

// Setup periodic cleanup
if (typeof window !== 'undefined') {
    setInterval(cleanupExpiredEntries, CLEANUP_INTERVAL);
}

export default {
    generateCacheKey,
    getFromCache,
    setInCache,
    deleteFromCache,
    cleanupExpiredEntries,
    getCacheStats,
    clearCache,
};
