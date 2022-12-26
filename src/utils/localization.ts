import { LocalizationTextData } from 'types/localization'

class Localization
{
    private static language: string;
    private static data: LocalizationTextData;

    public static initialize() {
        let localLanguage = localStorage.getItem('language-key');
        this.language = localLanguage ? localLanguage : 'eng';
        this.data = require('data/text')
    }

    /** Returns a text corresponding to the given key  */
    public static toText(key: string): string {
        return this.data[this.language].content[key]
    }
}

export default Localization