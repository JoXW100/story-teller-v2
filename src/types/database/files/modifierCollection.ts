import type { FileType } from "."
import type { ObjectId, ObjectIdText } from ".."
import type { ArmorType, Attribute, Language, Skill, Tool, WeaponType } from "types/database/dnd"

export type EnumChoiceData = { type: "enum", label: string, enum: string, options: string[] }
export type AnyFileChoiceData = { type: "file", label: string, allowAny: true, options: FileType[] }
export type FileChoiceData = { type: "file", label: string, allowAny: false, options: ObjectId[] }

export type ChoiceData = EnumChoiceData | AnyFileChoiceData | FileChoiceData
 
interface IModifierCollection {
    bonusAC: number
    bonusNumHealthDice: number
    bonusHealth: number
    bonusProficiency: number
    bonusInitiative: number

    join: (other: IModifierCollection) => IModifierCollection
    getChoices: () => Record<string, ChoiceData>

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