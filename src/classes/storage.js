
class Storage {
    /**
     * Sets the value of the item at the given key
     * @static
     * @public
     * @param {string} key 
     * @param {any} value 
     * @returns {boolean}
     */
    static set(key, value) {
        if (typeof window !== "undefined") {
            window.localStorage.setItem(key, value)
            return true
        }
        return false
    }

    /**
     * Gets the value of the item at the given key
     * @static
     * @public
     * @param {string} key 
     * @returns {any}
     */
    static get(key) {
        if (typeof window !== "undefined") {
            return window.localStorage.getItem(key)
        }
        return undefined
    }
}

export default Storage