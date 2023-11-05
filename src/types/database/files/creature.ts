import type { IFileContent, IFileMetadata, IFileStorage, FileType, IFileData } from "."
import type{ AdvantageBinding, Alignment, ArmorType, Attribute, CreatureType, DiceType, Language, MovementType, OptionalAttribute, ProficiencyLevel, Sense, SizeType, Skill, Tool, WeaponType } from "../dnd"
import type { IOptionType } from "../editor"
import type { ObjectIdText } from ".."

export enum CreatureValue {
    STR = "str",
    DEX = "dex",
    CON = "con",
    INT = "int",
    WIS = "wis",
    CHA = "cha",
    Proficiency = "proficiency",
    SpellAttribute = "spellAttribute",
    Level = "level",
    CasterLevel = "casterLevel"
}

interface ICreatureContent extends IFileContent {
}

interface ICreatureMetadata extends IFileMetadata {
    type?: CreatureType
    size?: SizeType
    alignment?: Alignment
    portrait?: string
    challenge?: number
    xp?: number

    // Stats
    level?: number
    hitDice?: DiceType
    health?: IOptionType<number>
    ac?: IOptionType<number>
    proficiency?: IOptionType<number>
    initiative?: IOptionType<number>
    str?: number
    dex?: number
    con?: number
    int?: number
    wis?: number
    cha?: number
    critRange?: number
    multiAttack?: number
    bonusDamage?: number

    resistances?: string
    vulnerabilities?: string
    dmgImmunities?: string
    conImmunities?: string
    advantages?: Partial<Record<AdvantageBinding, string>>
    disadvantages?: Partial<Record<AdvantageBinding, string>>
    
    speed?: Partial<Record<MovementType, number>>
    senses?: Partial<Record<Sense, number>>

    // Passives
    passivePerception?: IOptionType<number>
    passiveInvestigation?: IOptionType<number>
    passiveInsight?: IOptionType<number>

    // Proficiencies
    proficienciesSave?: Attribute[]
    proficienciesArmor?: ArmorType[]
    proficienciesWeapon?: WeaponType[]
    proficienciesLanguage?: Language[]
    proficienciesTool?: Partial<Record<Tool, ProficiencyLevel>>
    proficienciesSkill?: Partial<Record<Skill, ProficiencyLevel>>

    // Abilities
    abilities?: ObjectIdText[]
    
    // Spells
    casterLevel?: IOptionType<number>
    spellAttribute?: OptionalAttribute
    spellSlots?: number[]
    spells?: ObjectIdText[]
}

interface ICreatureStorage extends IFileStorage {
    abilityData?: Record<string, number>
    spellData?: number[]
}

abstract class CreatureFile implements IFileData {
    type: FileType.Creature
    content: ICreatureContent
    metadata: ICreatureMetadata
    storage: ICreatureStorage
}

export type {
    ICreatureContent,
    ICreatureMetadata,
    ICreatureStorage,
    CreatureFile
}