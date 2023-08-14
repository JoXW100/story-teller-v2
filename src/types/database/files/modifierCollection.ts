import type { FileType } from "."
import type { ObjectId, ObjectIdText } from ".."
import { IChoice } from "./modifier"
import type { ArmorType, Attribute, Language, Skill, Tool, WeaponType } from "types/database/dnd"

export type EnumChoiceData = { type: "enum", label: string, enum: string, options: string[] }
export type AnyFileChoiceData = { type: "file", label: string, allowAny: true, options: FileType[] }
export type FileChoiceData = { type: "file", label: string, allowAny: false, options: ObjectId[] }
export type ChoiceChoiceData = { type: "choice", label: string, options: IChoice[] }

export type ChoiceData = EnumChoiceData | AnyFileChoiceData | FileChoiceData | ChoiceChoiceData
 
interface IModifierCollection {
    equals(other: IModifierCollection): boolean
    join: (other: IModifierCollection) => IModifierCollection
    getChoices: () => Record<string, ChoiceData>

    // Bonus
    bonusAC: number
    bonusNumHealthDice: number
    bonusHealth: number
    bonusProficiency: number
    bonusInitiative: number

    getAttributeBonus: (attribute: Attribute) => number

    // Set
    critRange: number

    // Add / Remove
    modifyProficienciesArmor: (proficiencies: ArmorType[], onlyRemove?: boolean) => ArmorType[]
    modifyProficienciesWeapon: (proficiencies: WeaponType[], onlyRemove?: boolean) => WeaponType[]
    modifyProficienciesTool: (proficiencies: Tool[], onlyRemove?: boolean) => Tool[]
    modifyProficienciesLanguage: (proficiencies: Language[], onlyRemove?: boolean) => Language[]
    modifyProficienciesSave: (proficiencies: Attribute[], onlyRemove?: boolean) => Attribute[]
    modifyProficienciesSkill: (proficiencies: Skill[], onlyRemove?: boolean) => Skill[]
    modifyAbilities: (abilities: ObjectIdText[]) => ObjectIdText[]
}

export type {
    IModifierCollection
}