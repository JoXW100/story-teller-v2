import type { ArmorType, Attribute, Language, ProficiencyType, Skill, Tool, WeaponType } from "types/database/dnd"
import type { ObjectId } from ".."
import { IItemMetadata } from "."

export enum ModifierBonusTypeProperty {
    AC = "ac",
    Attribute = "attribute",
    NumHitDice = "numHitDice",
    Health = "health",
    Proficiency = "proficiency",
    Initiative = "initiative"
}

export enum ModifierAddRemoveTypeProperty {
    Proficiency = "proficiency",
    Ability = "ability",
    Spell = "spell"
}

export enum ModifierSetTypeProperty {
    CritRange = "critRange",
    SpellAttribute = "spellAttribute"
}

export enum ModifierType {
    Bonus = "bonus", // Adds/Removes a flat value
    Set = "set", // Sets value
    Add = "add", // Adds item to collection
    Remove = "remove", // Removes item from collection
    Choice = "choice" // Chose between different modifiers
}

export enum SelectType {
    Value = "value",
    Choice = "choice",
}

export enum ModifierCondition {
    None = "none",
}

export enum ModifierSetMethod {
    Exact = "exact",
    Max = "max",
    Min = "min"
}

interface IModifier extends IItemMetadata {
    condition?: ModifierCondition
    type?: ModifierType
    select?: SelectType
    bonusProperty?: ModifierBonusTypeProperty
    addRemoveProperty?: ModifierAddRemoveTypeProperty
    setProperty?: ModifierSetTypeProperty

    label?: string
    allowAny?: boolean

    proficiency?: ProficiencyType

    // Values
    value?: number
    file?: ObjectId
    files?: ObjectId[]
    attribute?: Attribute
    attributes?: Attribute[]
    armor?: ArmorType
    armors?: ArmorType[]
    weapon?: WeaponType
    weapons?: WeaponType[]
    tool?: Tool
    tools?: Tool[]
    language?: Language
    languages?: Language[]
    save?: Attribute
    saves?: Attribute[]
    skill?: Skill
    skills?: Skill[]
    choices?: IChoice[]
}

interface IChoice extends IItemMetadata {
    label?: string
    modifiers?: IModifier[]
}

export type {
    IModifier,
    IChoice
}