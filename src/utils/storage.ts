
class Storage {
    /** Sets the value of the item at the given key */
    static set(key: string, value: any): boolean {
        if (typeof window !== "undefined") {
            window.localStorage.setItem(key, value)
            return true
        }
        return false
    }

    /** Gets the value of the item at the given key */
    static get<T>(key: string): T {
        if (typeof window !== "undefined") {
            return window.localStorage.getItem(key) as T
        }
        return undefined
    }
}

export default Storage