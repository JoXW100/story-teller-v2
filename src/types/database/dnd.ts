
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

export enum OptionalAttribute {
    None = "none",
    STR = "str",
    DEX = "dex",
    CON = "con",
    INT = "int",
    WIS = "wis",
    CHA = "cha"
}

export enum Alignment {
    None = "none",
    Unaligned = "unaligned",
    Any = "any",
    LawfulGood = "lg",
    LawfulNeutral = "ln",
    LawfulEvil = "le",
    NeutralGood = "ng",
    TrueNeutral = "nn",
    NeutralEvil = "ne",
    ChaoticGood = "cg",
    ChaoticNeutral = "cn",
    ChaoticEvil = "ce"
}

export enum DiceType {
    None = 0,
    D4 = 4,
    D6 = 6,
    D8 = 8,
    D10 = 10,
    D12 = 12,
    D20 = 20,
    D100 = 100
}

export enum Skill {
    Acrobatics = "acrobatics",
    AnimalHandling = "animalHandling",
    Arcana = "arcana",
    Athletics = "athletics",
    Deception = "deception",
    History = "history",
    Insight = "insight",
    Intimidation = "intimidation",
    Investigation = "investigation",
    Medicine = "medicine",
    Nature = "nature",
    Perception = "perception", 
    Performance = "performance",
    Persuasion = "persuasion",
    Religion = "religion",
    SleightOfHand = "sleightOfHand",
    Stealth = "stealth",
    Survival = "survival"
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
    Point = "point",
    Touch = "touch"
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

export enum ItemType {
    Armor = 'armor',
    Trinket = 'trinket',
    Consumable = 'consumable',
    MeleeWeapon = 'meleeWeapon',
    RangedWeapon = 'rangedWeapon',
    ThrownWeapon = 'thrownWeapon',
}

export enum ActionType {
    None = "none",
    Action = "action",
    BonusAction = "bonusAction",
    Reaction = "reaction",
    Special = "special",
    Legendary = "legendary",
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

export enum ArmorType {
    Light = "light",
    Medium = "medium",
    Heavy = "heavy",
    Shields = "shields"
}

export enum WeaponType {
    Simple = "simple",
    Martial = "martial",
    Club = "club",
    Battleaxe = "battleaxe",
    Blowgun = "blowgun",
    Dagger = "dagger",
    Dart = "dart",
    Flail = "flail",
    Greataxe = "greataxe",
    Greatclub = "greatclub",
    Greatsword = "greatsword",
    Halberd = "halberd",
    Handaxe = "handaxe",
    HeavyCrossbow = "heavyCrossbow",
    Javelin = "javelin",
    Lance = "lance",
    LightHammer = "lightHammer",
    LightCrossbow = "lightCrossbow",
    Longbow = "longbow",
    Longsword = "longsword",
    Mace = "mace",
    Maul = "maul",
    Net = "net",
    Morningstar = "morningstar",
    Pike = "pike",
    Quarterstaff = "quarterstaff",
    Rapier = "rapier",
    Scimitar = "scimitar",
    Shortsword = "shortsword",
    Shortbow = "shortbow",
    Sling = "sling",
    Sickle = "sickle",
    Spear = "spear",
    Trident = "trident",
    HandCrossbow = "handCrossbow",
    WarPick = "warPick",
    Warhammer = "warhammer",
    Whip = "whip",
}

export enum MeleeWeaponType {
    Club = "club",
    Battleaxe = "battleaxe",
    Dagger = "dagger",
    Flail = "flail",
    Greataxe = "greataxe",
    Greatclub = "greatclub",
    Greatsword = "greatsword",
    Halberd = "halberd",
    Handaxe = "handaxe",
    Javelin = "javelin",
    Lance = "lance",
    LightHammer = "lightHammer",
    Longsword = "longsword",
    Mace = "mace",
    Maul = "maul",
    Morningstar = "morningstar",
    Pike = "pike",
    Quarterstaff = "quarterstaff",
    Rapier = "rapier",
    Scimitar = "scimitar",
    Shortsword = "shortsword",
    Sickle = "sickle",
    Spear = "spear",
    Trident = "trident",
    WarPick = "warPick",
    Warhammer = "warhammer",
    Whip = "whip",
    Grenade = "grenade",
    Improvised = "improvised"
}

export enum ThrownWeaponType {
    Dagger = "daggers",
    Handaxe = "handaxe",
    Javelin = "javelin",
    LightHammer = "lightHammer",
    Trident = "trident",
    Spear = "spear",
    Grenade = "grenade",
    Improvised = "improvised"
}

export enum RangedWeaponType {
    Blowgun = "blowgun",
    HandCrossbow = "handCrossbow",
    HeavyCrossbow = "heavyCrossbow",
    LightCrossbow = "lightCrossbow",
    Longbow = "longbow",
    Net = "net",
    Shortbow = "shortbow",
    Sling = "sling",
    Improvised = "improvised"
}

export enum Tool {
    AlchemistsSupplies = "alchemistsSupplies",
    HerbalismKit = "herbalismKit",
    PoisonersKit = "poisonersKit",
    ThievesTools = "thievesTools"
}

export enum Language {
    Common = "common",
    Giant = "giant",
    Leonin = "leonin",
    ThievesCant = "thieves"
}

export enum Sense {
    BlindSight = "blindSight",
    DarkVision = "darkVision",
    TremorSense = "tremorSense",
    TrueSight = "trueSight",
}

export enum ProficiencyType {
    Armor = "armor",
    Weapon = "weapon",
    Tool = "tool",
    Language = "language",
    Save = "save",
    Skill = "skill",
}

export enum ProficiencyLevel {
    Proficient = "proficient",
    HalfProficient = "halfProficient",
    Expert = "expert",
}

export enum RestType {
    None = "none",
    ShortRest = "short",
    LongRest = "long"
}

export enum Rarity {
    Mundane = 'mundane',
    Common = 'common',
    Uncommon = 'uncommon',
    Rare = 'rare',
    VeryRare = 'veryRare',
    Legendary = 'legendary',
    Artifact = 'artifact'
}

export enum AdvantageBinding {
    General = "general",
    
    StrengthSave = "strSave",
    DexteritySave = "dexSave",
    ConstitutionSave = "conSave",
    IntelligenceSave = "intSave",
    WisdomSave = "wisSave",
    CharismaSave = "chaSave",

    AcrobaticsCheck = "acrobaticsCheck",
    AnimalHandlingCheck = "animalCheck",
    ArcanaCheck = "arcanaCheck",
    AthleticsCheck = "athleticsCheck",
    DeceptionCheck = "deceptionCheck",
    HistoryCheck = "historyCheck",
    InsightCheck = "insightCheck",
    IntimidationCheck = "intimidationCheck",
    InvestigationCheck = "investigationCheck",
    MedicineCheck = "medicineCheck",
    NatureCheck = "natureCheck",
    PerceptionCheck = "perceptionCheck",
    PerformanceCheck = "performanceCheck",
    PersuasionCheck = "persuasionCheck",
    ReligionCheck = "religionCheck",
    SleightOfHandCheck = "sleightCheck",
    StealthCheck = "stealthCheck",
    SurvivalCheck = "survivalCheck",
}