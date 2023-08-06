import { TextData } from 'types/localization'

abstract class Localization
{
    private static language: string;
    private static data: Record<string, TextData>;

    public static initialize() {
        let localLanguage = localStorage.getItem('language-key');
        this.language = localLanguage ? localLanguage : 'eng';
        this.data = require('data/text')
    }

    /** Returns a text corresponding to the given key  */
    public static toText(key: string, ...args: any[]): string {
        try {
            let text = this.data[this.language]?.content[key] ?? ""
            // Replace @{x} values in text
            for (let index = 0; index < args.length; index++) {
                text = text.replace(`@${index}`, args[index])
            }
            return text
        } catch (error) {
            console.warn("No localization text for: " + key)
            return ""
        }
    }
}

export default Localization