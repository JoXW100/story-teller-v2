import { TextData } from "data";
import Logger from "./logger";

abstract class Localization
{
    public static get LanguageKey(): string { return 'language-key' };
    private static language: string;

    public static initialize() {
        let localLanguage = localStorage.getItem(this.LanguageKey);
        this.language = localLanguage ? localLanguage : 'eng';
    }

    /** Returns a text corresponding to the given key  */
    public static toText(key: string, ...args: any[]): string {
        try {
            let text = TextData[this.language]?.content[key] ?? ""
            // Replace @{x} values in text
            for (let index = 0; index < args.length; index++) {
                text = text.replace(`@${index}`, args[index])
            }
            return text
        } catch (error) {
            Logger.error("Localization.toText", "No localization text for: " + key);
            return ""
        }
    }
}

export default Localization