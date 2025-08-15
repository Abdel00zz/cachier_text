
import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
    const [loading, setLoading] = useState(true);
    const [storedValue, setStoredValue] = useState<T>(initialValue);

    useEffect(() => {
        try {
            const item = window.localStorage.getItem(key);
            if (item) {
                setStoredValue(JSON.parse(item));
            } else {
                setStoredValue(initialValue);
                window.localStorage.setItem(key, JSON.stringify(initialValue));
            }
        } catch (error) {
            console.error(error);
            setStoredValue(initialValue);
        } finally {
            setLoading(false);
        }
    }, [key, initialValue]);

    const setValue = useCallback((value: T | ((val: T) => T)) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error(error);
        }
    }, [key, storedValue]);

    return { storedValue, setValue, loading };
}
