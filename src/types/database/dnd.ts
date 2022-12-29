
export enum Gender {
    Male = "male",
    Female = "female",
    Other = "other"
}

export enum MagicSchool {
    Abjuration = "abjuration",
    Conjuration = "conjuration",
    Divination = "divination",
    Dunamancy = "dunamancy",
    Enchantment = "enchantment",
    Evocation = "evocation",
    Illusion = "illusion",
    Necromancy = "necromancy",
    Transmutation = "transmutation"
}

export enum SizeType {
    Tiny = "tiny",
    Small = "small",
    Medium = "medium",
    Large = "large",
    Huge = "huge",
    Gargantuan = "gargantuan"
}

export enum CreatureType {
    None = "none",
    Aberration = "aberration",
    Beast = "beast",
    Celestial = "celestial",
    Construct = "construct",
    Dragon = "dragon",
    Elemental = "elemental",
    Fey = "fey",
    Fiend = "fiend",
    Giant = "giant",
    Humanoid = "humanoid",
    Monstrosity = "monstrosity",
    Ooze = "ooze",
    Plant = "plant",
    Undead = "undead"
}

export enum MovementType {
    Walk = "walk",
    Burrow = "burrow",
    Climb = "climb",
    Fly = "fly",
    Hover = "hover",
    Swim = "swim"
}

export enum Attribute {
    STR = "str",
    DEX = "dex",
    CON = "con",
    INT = "int",
    WIS = "wis",
    CHA = "cha"
}

export enum Alignment {
    None,
    Unaligned,
    LawfulGood,
    LawfulNeutral,
    LawfulEvil,
    NeutralGood,
    TrueNeutral,
    NeutralEvil,
    ChaoticGood,
    ChaoticNeutral,
    ChaoticEvil
}

export enum DiceType {
    None = 0,
    D4 = 4,
    D6 = 6,
    D8 = 8,
    D10 = 10,
    D12 = 12,
    D20 = 20
}

export enum Skill {
    Acrobatics,
    AnimalHandling,
    Arcana,
    Athletics,
    Deception,
    History,
    Insight,
    Intimidation,
    Investigation,
    Medicine,
    Nature,
    Perception, 
    Performance,
    Persuasion,
    Religion,
    SleightOfHand,
    Stealth,
    Survival
}

export enum DamageType {
    None = "none",
    Special = "special",
    Acid = "acid",
    Bludgeoning = "bludgeoning",
    Cold = "cold",
    Fire = "fire",
    Force = "force",
    Lightning = "lightning",
    Necrotic = "necrotic",
    Piercing = "piercing",
    Poison = "poison",
    Psychic = "psychic",
    Radiant = "radiant",
    Slashing = "slashing",
    Thunder = "thunder",
}

export enum TargetType {
    None = "none",
    Self = "self",
    Single = "single",
    Multiple = "multiple",
    Point = "point"
}

export enum AreaType {
    None = "none",
    Cone = "cone",
    Cube = "cube",
    Square = "square",
    Line = "line",
    Sphere = "sphere",
    Cylinder = "cylinder"
}

export enum AbilityType {
    Feature = 'feature',
    MeleeAttack = 'meleeAttack',
    RangedAttack = 'rangedAttack',
    MeleeWeapon = 'meleeWeapon',
    RangedWeapon = 'rangedWeapon',
    ThrownWeapon = 'thrownWeapon'
}

export enum ActionType {
    None = "none",
    Action = "action",
    BonusAction = "bonusAction",
    Reaction = "reaction",
    Special = "special",
    //Legendary = "legendary",
}

export enum EffectCondition {
    None = "none",
    Hit = "hit",
    Save = "save"
}

export enum ScalingType {
    None = "none",
    Finesse = "finesse",
    SpellModifier = "spellMod",
    STR = "str",
    DEX = "dex",
    CON = "con",
    INT = "int",
    WIS = "wis",
    CHA = "cha"
}

export enum Duration {
    Instantaneous = "instantaneous",
    Round = "round",
    Minute = "minute",
    Hour = "hour",
    Day = "day",
    Custom = "custom"
}

export enum CastingTime {
    Action = "action",
    BonusAction = "bonusAction",
    Reaction = "reaction",
    Minute = "minute",
    Hour = "hour",
    Custom = "custom",
}