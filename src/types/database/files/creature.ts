import { FileContent, FileMetadata } from "."
import { Alignment, Attribute, CreatureType, DiceType, MovementType, SizeType, Skill } from "../dnd"
import { OptionType } from "../editor"
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
    // Stats
    level?: number
    hitDice?: DiceType
    health?: OptionType<number>
    ac?: OptionType<number>
    proficiency?: OptionType<number>
    initiative?: OptionType<number>
    resistances?: string
    vulnerabilities?: string // TODO: Implement
    advantages?: string
    dmgImmunities?: string
    conImmunities?: string
    speed?: Partial<Record<MovementType, number>>
    // Info
    saves?: Partial<Record<Attribute, number>>
    skills?: Partial<Record<Skill, number>>
    senses?: string
    languages?: string
    challenge?: number
    xp?: number
    // Spells
    spellSlots?: number[]
    spells?: string[]
}

export type {
    CreatureContent,
    CreatureMetadata
}