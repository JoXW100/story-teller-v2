import type { FileType } from "."
import type { ObjectId, ObjectIdText } from ".."
import type { IChoice } from "./modifier"
import type { ArmorType, Attribute, Language, Skill, Tool, WeaponType } from "types/database/dnd"

export type EnumChoiceData = { type: "enum", label: string, enum: string, options: string[], num: number }
export type TextChoiceData = { type: "text", label: string, text: string, options: string[], num: number }
export type AnyFileChoiceData = { type: "file", label: string, allowAny: true, options: FileType[], num: number }
export type FileChoiceData = { type: "file", label: string, allowAny: false, options: ObjectId[], num: number }
export type ChoiceChoiceData = { type: "choice", label: string, options: IChoice[], num: number }

export type ChoiceData = EnumChoiceData | TextChoiceData | AnyFileChoiceData | FileChoiceData | ChoiceChoiceData
 
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
    spellAttribute: Attribute

    // Add / Remove
    modifyProficienciesArmor: (proficiencies: ArmorType[], onlyRemove?: boolean) => ArmorType[]
    modifyProficienciesWeapon: (proficiencies: WeaponType[], onlyRemove?: boolean) => WeaponType[]
    modifyProficienciesTool: (proficiencies: Tool[], onlyRemove?: boolean) => Tool[]
    modifyProficienciesLanguage: (proficiencies: Language[], onlyRemove?: boolean) => Language[]
    modifyProficienciesSave: (proficiencies: Attribute[], onlyRemove?: boolean) => Attribute[]
    modifyProficienciesSkill: (proficiencies: Skill[], onlyRemove?: boolean) => Skill[]

    modifyResistances: (resistances: string[], onlyRemove?: boolean) => string[]
    modifyVulnerabilities: (vulnerabilities: string[], onlyRemove?: boolean) => string[]
    modifyAdvantages: (advantages: string[], onlyRemove?: boolean) => string[]
    modifyDisadvantages: (disadvantages: string[], onlyRemove?: boolean) => string[]
    modifyDMGImmunities: (dmgImmunities: string[], onlyRemove?: boolean) => string[]
    modifyCONImmunities: (conImmunities: string[], onlyRemove?: boolean) => string[]

    modifyAbilities: (abilities: ObjectIdText[]) => ObjectIdText[]
    modifySpells: (spells: ObjectIdText[]) => ObjectIdText[]
}

export type {
    IModifierCollection
}