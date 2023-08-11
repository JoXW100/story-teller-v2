import { FileContent, FileMetadata } from "."
import { Alignment, ArmorType, Attribute, CreatureType, DiceType, Language, MovementType, Sense, SizeType, Skill, Tool, WeaponType } from "../dnd"
import { IOptionType } from "../editor"
import ICreatureStats from "./iCreatureStats"

interface CreatureContent extends FileContent {
    text: string
}

interface CreatureMetadata extends FileMetadata, Omit<ICreatureStats, "proficiency"> {
    name?: string
    public?: boolean
    type?: CreatureType
    size?: SizeType
    alignment?: Alignment
    portrait?: string
    description?: string

    abilities?: string[]
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
    spells?: string[]
}

export type {
    CreatureContent,
    CreatureMetadata
}