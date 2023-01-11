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
    advantages?: string
    dmgImmunities?: string
    conImmunities?: string
    speed?: { [key: string | MovementType]: number }
    // Info
    saves?: { [key: string | Attribute]: number }
    skills?: { [key: number | Skill]: number }
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