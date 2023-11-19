import type { FileType } from "."
import type { ObjectId, ObjectIdText } from ".."
import type { IChoice, ModifierBonusTypeProperty } from "./modifier"
import type { AdvantageBinding, ArmorType, Attribute, Language, MovementType, ProficiencyLevel, Sense, SizeType, Skill, Tool, WeaponType } from "types/database/dnd"

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
    length: () => number

    // Bonus
    getBonus: (type: ModifierBonusTypeProperty) => number
    getMovementBonus: (movement: MovementType) => number
    getAttributeBonus: (attribute: Attribute) => number

    // Set
    readonly critRange: number
    readonly maxDEXBonus: number
    readonly spellAttribute: Attribute
    readonly size: SizeType 
    readonly multiAttack: number
    getACBase: (values: Record<Attribute, number>) => number
    getSenseRange: (sense: Sense) => number

    // Add / Remove
    modifyProficienciesArmor: (proficiencies: ArmorType[], onlyRemove?: boolean) => ArmorType[]
    modifyProficienciesWeapon: (proficiencies: WeaponType[], onlyRemove?: boolean) => WeaponType[]
    modifyProficienciesTool: (proficiencies: Partial<Record<Tool, ProficiencyLevel>>, onlyRemove?: boolean) => Partial<Record<Tool, ProficiencyLevel>>
    modifyProficienciesLanguage: (proficiencies: Language[], onlyRemove?: boolean) => Language[]
    modifyProficienciesSave: (proficiencies: Attribute[], onlyRemove?: boolean) => Attribute[]
    modifyProficienciesSkill: (proficiencies: Partial<Record<Skill, ProficiencyLevel>>, onlyRemove?: boolean) => Partial<Record<Skill, ProficiencyLevel>>

    modifyAdvantages: (advantages: Partial<Record<AdvantageBinding, string>>, onlyRemove?: boolean) => Partial<Record<AdvantageBinding, string>>
    modifyDisadvantages: (disadvantages:Partial<Record<AdvantageBinding, string>>, onlyRemove?: boolean) => Partial<Record<AdvantageBinding, string>>
    modifyResistances: (resistances: string[], onlyRemove?: boolean) => string[]
    modifyVulnerabilities: (vulnerabilities: string[], onlyRemove?: boolean) => string[]
    modifyDMGImmunities: (dmgImmunities: string[], onlyRemove?: boolean) => string[]
    modifyCONImmunities: (conImmunities: string[], onlyRemove?: boolean) => string[]

    modifyAbilities: (abilities: ObjectIdText[], onlyRemove?: boolean) => ObjectIdText[]
    modifySpells: (spells: ObjectIdText[], onlyRemove?: boolean) => ObjectIdText[]
}

export type {
    IModifierCollection
}