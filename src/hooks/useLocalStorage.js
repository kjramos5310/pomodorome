import { useState, useEffect } from 'react'

const read = (key, initialValue) => {
    try {
        const item = window.localStorage.getItem(key)
        return item !== null ? JSON.parse(item) : initialValue
    } catch (error) {
        console.warn(`useLocalStorage: error reading key "${key}"`, error)
        return initialValue
    }
}

/**
 * Hook que sincroniza estado de React con localStorage.
 * Los datos persisten entre recargas de página (F5).
 *
 * Usa el setState normal de React (estable entre renders y con updates
 * funcionales correctos) y escribe en localStorage cuando cambia el valor.
 */
export function useLocalStorage(key, initialValue) {
    const [storedValue, setStoredValue] = useState(() => read(key, initialValue))

    useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(storedValue))
        } catch (error) {
            console.warn(`useLocalStorage: error writing key "${key}"`, error)
        }
    }, [key, storedValue])

    return [storedValue, setStoredValue]
}
