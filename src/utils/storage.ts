
abstract class Storage {
    /** Sets the value of the item at the given key */
    static setString(key: string, value: string): boolean {
        if (typeof window !== "undefined") {
            window.localStorage.setItem(key, value)
            return true
        }
        return false
    }

    /** Sets the value of the item at the given key */
    static setInt(key: string, value: number): boolean {
        if (typeof window !== "undefined") {
            window.localStorage.setItem(key, value.toString())
            return true
        }
        return false
    }
    
    /** Sets the value of the item at the given key */
    static setBoolean(key: string, value: boolean): boolean {
        if (typeof window !== "undefined") {
            window.localStorage.setItem(key, value ? "true" : "false")
            return true
        }
        return false
    }

    /** Gets the value of the item at the given key */
    static getString(key: string): string | undefined {
        if (typeof window !== "undefined") {
            return window.localStorage.getItem(key) ?? undefined
        }
        return undefined
    }

    /** Gets the value of the item at the given key */
    static getInt(key: string): number | undefined  {
        if (typeof window !== "undefined") {
            var value = window.localStorage.getItem(key)
            if (value !== null) {
                var num = parseInt(value)
                return isNaN(num) ? undefined : num;
            }
        }
        return undefined
    }

    /** Gets the value of the item at the given key */
    static getBoolean(key: string): boolean | undefined {
        if (typeof window !== "undefined") {
            var value = window.localStorage.getItem(key)
            if (value !== null) {
                return value === "true"
            }
        }
        return undefined
    }
}

export default Storage