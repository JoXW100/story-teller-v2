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

export const Open5eCompendiumData: ICompendiumMenuItem[] = Open5eCompendiumMenu;
export const HelpData: IHelpData = Help;
export const TextData: Record<string, ITextData> = Text;