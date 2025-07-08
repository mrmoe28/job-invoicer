'use client';

import { useState, useEffect, useCallback } from 'react';

type StorageType = 'localStorage' | 'sessionStorage';

export interface UseLocalStorageOptions {
  storageType?: StorageType;
  serializer?: {
    read: (value: string) => any;
    write: (value: any) => string;
  };
}

const defaultSerializer = {
  read: (value: string) => {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  },
  write: (value: any) => JSON.stringify(value),
};

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions = {}
) {
  const {
    storageType = 'localStorage',
    serializer = defaultSerializer,
  } = options;

  // Get storage object
  const getStorage = useCallback(() => {
    if (typeof window === 'undefined') return null;
    return storageType === 'localStorage' ? localStorage : sessionStorage;
  }, [storageType]);

  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const storage = getStorage();
      if (!storage) return initialValue;

      const item = storage.getItem(key);
      return item ? serializer.read(item) : initialValue;
    } catch (error) {
      console.error(`Error reading ${storageType} key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to storage
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        // Allow value to be a function so we have the same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        
        // Save state
        setStoredValue(valueToStore);
        
        // Save to storage
        const storage = getStorage();
        if (storage) {
          if (valueToStore === undefined || valueToStore === null) {
            storage.removeItem(key);
          } else {
            storage.setItem(key, serializer.write(valueToStore));
          }
        }
      } catch (error) {
        console.error(`Error setting ${storageType} key "${key}":`, error);
      }
    },
    [key, serializer, storageType, storedValue, getStorage]
  );

  // Remove item from storage
  const removeValue = useCallback(() => {
    try {
      const storage = getStorage();
      if (storage) {
        storage.removeItem(key);
        setStoredValue(initialValue);
      }
    } catch (error) {
      console.error(`Error removing ${storageType} key "${key}":`, error);
    }
  }, [key, initialValue, storageType, getStorage]);

  // Listen for changes in other tabs/windows
  useEffect(() => {
    const storage = getStorage();
    if (!storage || storageType !== 'localStorage') return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(serializer.read(e.newValue));
        } catch (error) {
          console.error(`Error parsing storage event for key "${key}":`, error);
        }
      } else if (e.key === key && e.newValue === null) {
        setStoredValue(initialValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, initialValue, serializer, storageType, getStorage]);

  return [storedValue, setValue, removeValue] as const;
}