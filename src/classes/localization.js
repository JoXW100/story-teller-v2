import '@types/data'

class Localization
{
    /** @type {string} @private @static*/
    static #language;
    /** @type {LocalizationTextData} @private @static*/
    static #data;

    /**
     * @static
     * @public
     */
    static initialize() {
        let localLanguage = localStorage.getItem('language-key');
        this.#language = localLanguage ? localLanguage : 'eng';
        this.#data = require('data/text')
    }

    /**
     * Returns a text corresponding to the given key
     * @static
     * @public
     * @param {string} key 
     * @returns {string}
     */
    static toText(key) {
        return this.#data[this.#language].content[key]
    }
}

export default Localization