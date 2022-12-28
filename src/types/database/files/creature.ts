import { Alignment, Attribute, CreatureType, DiceType, MovementType, SizeType, Skill } from "../dnd"
import { OptionalAttribute, OptionType } from "../editor"

interface CreatureContent {
    text: string
}

interface CreatureMetadata {
    name?: string
    public?: boolean
    type?: CreatureType
    size?: SizeType
    alignment?: Alignment
    portrait?: string
    abilities?: string[]
    // Texts
    appearance?: string
    description?: string
    history?: string
    notes?: string
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
    // Attributes
    str?: number
    dex?: number
    con?: number
    int?: number
    wis?: number
    cha?: number
    // Info
    saves?: { [key: string | Attribute]: number }
    skills?: { [key: number | Skill]: number }
    senses?: string
    languages?: string
    challenge?: number
    xp?: number
    // Spells
    spellAttribute?: OptionalAttribute
    spellSlots?: number[]
    spells?: string[]
}

export type {
    CreatureContent,
    CreatureMetadata
}