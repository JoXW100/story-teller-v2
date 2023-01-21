import { TextData } from 'types/localization'

class Localization
{
    private static language: string;
    private static data: Record<string, TextData>;

    public static initialize() {
        let localLanguage = localStorage.getItem('language-key');
        this.language = localLanguage ? localLanguage : 'eng';
        this.data = require('data/text')
    }

    /** Returns a text corresponding to the given key  */
    public static toText(key: string): string {
        try {
            return this.data[this.language]?.content[key] ?? ""
        } catch (error) {
            console.warn("No localization text for: " + key)
            return ""
        }
    }
}

export default Localization