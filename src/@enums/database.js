/** @enum {string} */
export const FileType = {
    Root: "root",
    Empty: "empty",
    Document: "doc",
    Folder: "folder",
    Creature: "cre",
    Ability: "abi",
    Character: "cha",
    Spell: "spe",
    Story: "sto"
}

/** @enum {string} */
export const CreatureSize = {
    Tiny: "tiny",
    Small: "small",
    Medium: "medium",
    Large: "large",
    Huge: "huge",
    Gargantuan: "gargantuan"
}

/** @enum {string} */
export const CreatureType = {
    None: "none",
    Aberration: "aberration",
    Beast: "beast",
    Celestial: "celestial",
    Construct: "construct",
    Dragon: "dragon",
    Elemental: "elemental",
    Fey: "fey",
    Fiend: "fiend",
    Giant: "giant",
    Humanoid: "humanoid",
    Monstrosity: "monstrosity",
    Ooze: "ooze",
    Plant: "plant",
    Undead: "undead"
}
/** @enum {string}  */
export const MovementType = {
    Walk: "walk",
    Burrow: "burrow",
    Climb: "climb",
    Fly: "fly",
    Hover: "hover",
    Swim: "swim"
}

/** @enum {string}  */
export const Attribute = {
    STR: "str",
    DEX: "dex",
    CON: "con",
    INT: "int",
    WIS: "wis",
    CHA: "cha"
}

/** @enum {number} */
export const Alignment = {
    None: 0,
    LawfulGood: 1,
    LawfulNeutral: 2,
    LawfulEvil: 3,
    NeutralGood: 4,
    TrueNeutral: 5,
    NeutralEvil: 6,
    ChaoticGood: 7,
    ChaoticNeutral: 8,
    ChaoticEvil: 9,
}

/** @enum {number} */
export const Dice = {
    None: 0,
    D4: 4,
    D6: 6,
    D8: 8,
    D10: 10,
    D12: 12,
    D20: 20
}

/** @enum {number} */
export const Skill = {
    Acrobatics: 0,
    AnimalHandling: 1,
    Arcana: 2,
    Athletics: 3,
    Deception: 4,
    Deception: 5,
    History: 6,
    Insight: 7,
    Intimidation: 8,
    Investigation: 9,
    Medicine: 10,
    Nature: 11,
    Perception: 12, 
    Performance: 13,
    Persuasion: 14,
    Religion: 15,
    SleightOfHand: 16,
    Stealth: 17,
    Survival: 18
}

/** @enum {string} */
export const AbilityType = {
    Feature: 'feature',
    //Special: 'special',
    //Trait: 'trait',
    MeleeAttack: 'meleeAttack',
    RangedAttack: 'rangedAttack',
    MeleeWeapon: 'meleeWeapon',
    RangedWeapon: 'rangedWeapon',
    //Skill: 'skill'
}

/** @enum {string} */
export const EffectCondition = {
    Hit: "hit",
    Save: "save",
    None: "none"
}

/** @enum {string} */
export const OptionalAttribute = {
    ...Attribute,
    None: "none"
}

/** @enum {string} */
export const Scaling = {
    ...Attribute,
    None: "none",
    Finesse: "finesse",
    SpellModifier: "spellMod",
    //SpellAttack: "spellAttack",
    //SpellSave: "spellSave"
}

/** @enum {string} */
export const DamageType = {
    Acid: "acid",
    Bludgeoning: "bludgeoning",
    Cold: "cold",
    Fire: "fire",
    Force: "force",
    Lightning: "lightning",
    Necrotic: "necrotic",
    Piercing: "piercing",
    Poison: "poison",
    Psychic: "psychic",
    Radiant: "radiant",
    Slashing: "slashing",
    Thunder: "thunder",
    Special: "special",
    None: "none"
}

/** @enum {string} */
export const ActionType = {
    Action: "action",
    BonusAction: "bonusAction",
    Reaction: "reaction",
    Special: "special",
    //Legendary: "legendary",
    None: "none"
}

/** @enum {string} */
export const Gender = {
    Male: "male",
    Female: "female",
    Other: "other"
}

/** @enum {string} */
export const AbilityTarget = {
    None: "none",
    Self: "self",
    Single: "single",
    Point: "point"
}

/** @enum {string} */
export const AbilityArea = {
    None: "none",
    Cone: "cone",
    Cube: "cube",
    Cylinder: "cylinder",
    Line: "line",
    Sphere: "sphere"
}

/** @enum {string} */
export const MagicSchool = {
    Abjuration: "abjuration",
    Conjuration: "conjuration",
    Divination: "divination",
    Dunamancy: "dunamancy",
    Enchantment: "enchantment",
    Evocation: "evocation",
    Illusion: "illusion",
    Necromancy: "necromancy",
    Transmutation: "transmutation"
}

/** @enum {string} */
export const CastingTime = {
    Action: "action",
    BonusAction: "bonusAction",
    Reaction: "reaction",
    Minute: "minute",
    Hour: "hour",
    Custom: "custom",
}

/** @enum {string} */
export const Duration = {
    Instantaneous: "instantaneous",
    Round: "round",
    Minute: "minute",
    Hour: "hour",
    Day: "day",
    Custom: "custom"
}