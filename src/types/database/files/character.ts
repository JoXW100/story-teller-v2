import { Alignment, Attribute, CreatureType, DiceType, Gender, MovementType, SizeType, Skill } from "../dnd"
import { OptionalAttribute, OptionType } from "../editor"

interface CharacterStats {
    str?: number
    dex?: number
    con?: number
    int?: number
    wis?: number
    cha?: number
    proficiency?: number
    spellAttribute?: OptionalAttribute
}

interface CharacterContent {
    text: string
}

interface CharacterMetadata {
    name?: string
    public?: boolean
    type?: CreatureType
    size?: SizeType
    alignment?: Alignment
    gender?: Gender
    age?: string
    height?: string
    weight?: string
    raceText?: string
    occupation?: string
    portrait?: string
    abilities?: string[]
    traits?: string[]
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
    CharacterContent,
    CharacterMetadata
}

export type {
    CharacterStats
}