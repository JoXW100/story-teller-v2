import type { ArmorType, Attribute, Language, ProficiencyType, Sense, Skill, Tool, WeaponType } from "types/database/dnd"
import type { ObjectId } from ".."
import type { ISubPageItemMetadata } from "."

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
    Spell = "spell",
    Resistance = "resistance",
    Vulnerability = "vulnerability",
    DMGImmunity = "dmgImmunity",
    CONImmunity = "conImmunity",
    Advantage = "advantage",
    Disadvantage = "disadvantage"
}

export enum ModifierSetTypeProperty {
    CritRange = "critRange",
    SpellAttribute = "spellAttribute",
    MaxDexBonus = "maxDexBonus",
    Sense = "sense"
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

interface IModifier extends ISubPageItemMetadata {
    condition?: ModifierCondition
    type?: ModifierType
    select?: SelectType
    bonusProperty?: ModifierBonusTypeProperty
    addRemoveProperty?: ModifierAddRemoveTypeProperty
    setProperty?: ModifierSetTypeProperty

    label?: string
    allowAny?: boolean
    numChoices?: number

    proficiency?: ProficiencyType

    // Values
    value?: number
    text?: string
    texts?: string[]
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
    sense?: Sense
    save?: Attribute
    saves?: Attribute[]
    skill?: Skill
    skills?: Skill[]
    choices?: IChoice[]
}

interface IChoice extends ISubPageItemMetadata {
    label?: string
    modifiers?: IModifier[]
}

export type {
    IModifier,
    IChoice
}