
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
    static get(key: string): any {
        if (typeof window !== "undefined") {
            return window.localStorage.getItem(key)
        }
        return undefined
    }
}

export default Storage