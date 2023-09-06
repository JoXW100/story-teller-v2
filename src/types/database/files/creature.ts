import type { IFileContent, IFileMetadata, IFileStorage, FileType, IFileData } from "."
import type { ObjectIdText } from ".."
import type{ AdvantageBinding, Alignment, ArmorType, Attribute, CreatureType, DiceType, Language, MovementType, ProficiencyLevel, Sense, SizeType, Skill, Tool, WeaponType } from "../dnd"
import type { IOptionType } from "../editor"
import type ICreatureStats from "./iCreatureStats"

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
}

interface ICreatureContent extends IFileContent {
}

interface ICreatureMetadata extends IFileMetadata, Omit<ICreatureStats, "proficiency"> {
    type?: CreatureType
    size?: SizeType
    alignment?: Alignment
    portrait?: string

    abilities?: ObjectIdText[]
    challenge?: number
    xp?: number

    // Stats
    level?: number
    hitDice?: DiceType
    health?: IOptionType<number>
    ac?: IOptionType<number>
    proficiency?: IOptionType<number>
    initiative?: IOptionType<number>

    resistances?: string
    vulnerabilities?: string
    dmgImmunities?: string
    conImmunities?: string
    advantages?: Partial<Record<AdvantageBinding, string>>
    disadvantages?: Partial<Record<AdvantageBinding, string>>
    
    speed?: Partial<Record<MovementType, number>>
    senses?: Partial<Record<Sense, number>>

    // Proficiencies
    proficienciesSave?: Attribute[]
    proficienciesSkill?: Partial<Record<Skill, ProficiencyLevel>>
    proficienciesArmor?: ArmorType[]
    proficienciesWeapon?: WeaponType[]
    proficienciesTool?: Partial<Record<Tool, ProficiencyLevel>>
    proficienciesLanguage?: Language[]
    
    // Spells
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

export default CreatureFile
export type {
    ICreatureContent,
    ICreatureMetadata,
    ICreatureStorage
}