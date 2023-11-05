
interface Open5eItemInfo {
    slug: string
    name: string
    level_int?: number
    [key: string]: any
}

interface ICompendiumMenuItem {
    title: string
    type: string
    fields: string[]
    sortFields: string[]
    headers: string[]
    query?: Record<string, string | number>
    subItems?: ICompendiumMenuItem[]
}

interface Open5eCreatureAction {
    name: string
    desc: string
    attack_bonus?: number
    damage_dice?: string
}

interface Open5eCreature {
    slug: string // id
    desc: string
    // Stats
    charisma: number
    constitution: number
    dexterity: number
    intelligence: number
    strength: number
    wisdom: number
    // Info
    hit_dice: string
    hit_points: number
    img_main: null
    languages: string
    name: string
    alignment: string
    armor_class: number
    armor_desc: string
    cr: number
    challenge_rating: string
    type: string
    sub_type: string
    senses: string
    size: string
    speed: Record<string, number>
    // Saves
    charisma_save: number | null
    constitution_save: number | null
    dexterity_save: number | null
    intelligence_save: number | null
    strength_save: number | null
    wisdom_save: number | null
    // Immunities & Resistances
    condition_immunities: string
    damage_immunities: string
    damage_resistances: string
    damage_vulnerabilities: string
    // Actions
    actions: Open5eCreatureAction[]
    legendary_actions: Open5eCreatureAction[] | string
    legendary_desc: string
    reactions: Open5eCreatureAction[] | string
    special_abilities: Open5eCreatureAction[] | string
    // Skills
    perception: number
    skills: Record<string, number>
    // Ignore
    document__license_url: string
    document__slug: string
    document__title: string
    group: null

    spell_list: string[] // open5e urls to the spell pages
}

export type {
    Open5eItemInfo,
    ICompendiumMenuItem,
    Open5eCreature,
    Open5eCreatureAction
}