import Help from "./help.json";
import Text from "./text.json";
import Open5eCompendiumMenu from "./open5eCompendiumMenu.json";
import { ICompendiumMenuItem } from "types/open5eCompendium";
import { IHelpData } from "types/help";

interface ITextData {
    language: string
    icon: string
    content: Record<string, string>
}

export const Open5eCompendiumData: ICompendiumMenuItem[] = Open5eCompendiumMenu as any;
export const HelpData: IHelpData = Help as any;
export const TextData: Record<string, ITextData> = Text as any;