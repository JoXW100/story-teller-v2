import type { IFileContent, IFileMetadata, IFileStorage, FileType, IFileData } from "."
import type { ObjectIdText } from ".."
import type{ Alignment, ArmorType, Attribute, CreatureType, DiceType, Language, MovementType, Sense, SizeType, Skill, Tool, WeaponType } from "../dnd"
import type { IOptionType } from "../editor"
import type ICreatureStats from "./iCreatureStats"

interface ICreatureContent extends IFileContent {
    text: string
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
    vulnerabilities?: string // TODO: Implement
    advantages?: string
    dmgImmunities?: string
    conImmunities?: string
    
    speed?: Partial<Record<MovementType, number>>
    senses?: Partial<Record<Sense, number>>

    // Proficiencies
    proficienciesSave?: Attribute[]
    proficienciesSkill?: Skill[]
    proficienciesArmor?: ArmorType[]
    proficienciesWeapon?: WeaponType[]
    proficienciesTool?: Tool[]
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