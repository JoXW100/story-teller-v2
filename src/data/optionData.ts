import { Enum } from 'types';
import { AbilityType, ActionType, Alignment, AreaType, ArmorType, Attribute, CastingTime, CreatureType, DamageType, DiceType, Duration, EffectCondition, Gender, ItemType, Language, MagicSchool, MeleeWeaponType, MovementType, OptionalAttribute, ProficiencyType, RangedWeaponType, Rarity, RestType, ScalingType, Sense, SizeType, Skill, TargetType, ThrownWeaponType, Tool, WeaponType } from 'types/database/dnd';
import { ModifierType, SelectType, ModifierCondition, ModifierBonusTypeProperty, ModifierAddRemoveTypeProperty, ModifierSetTypeProperty } from 'types/database/files/modifier';
import { CalculationMode, RenderedFileType } from 'types/database/editor';

interface IOptionType<T extends Enum> {
    enum: T
    default: T[keyof T],
    options: Record<T[keyof T], string>
}

const OptionTypes = {
    "creatureSize": {
        enum: SizeType,
        default: SizeType.Medium,
        options: {
            [SizeType.Gargantuan]: "Gargantuan",
            [SizeType.Huge]: "Huge",
            [SizeType.Large]: "Large",
            [SizeType.Medium]: "Medium",
            [SizeType.Small]: "Small",
            [SizeType.Tiny]: "Tiny"
        }
    } satisfies IOptionType<typeof SizeType>,
    "creatureType": {
        enum: CreatureType,
        default: CreatureType.None,
        options: {
            [CreatureType.None]: "None",
            [CreatureType.Aberration]: "Aberration",
            [CreatureType.Beast]: "Beast",
            [CreatureType.Celestial]: "Celestial",
            [CreatureType.Construct]: "Construct",
            [CreatureType.Dragon]: "Dragon",
            [CreatureType.Elemental]: "Elemental",
            [CreatureType.Fey]: "Fey",
            [CreatureType.Fiend]: "Fiend",
            [CreatureType.Giant]: "Giant",
            [CreatureType.Humanoid]: "Humanoid",
            [CreatureType.Monstrosity]: "Monstrosity",
            [CreatureType.Ooze]: "Ooze",
            [CreatureType.Plant]: "Plant",
            [CreatureType.Undead]: "Undead"
        }
    } satisfies IOptionType<typeof CreatureType>,
    "alignment": {
        enum: Alignment,
        default: Alignment.None,
        options: {
            [Alignment.None]: "None",
            [Alignment.Unaligned]: "Unaligned",
            [Alignment.Any]: "Any",
            [Alignment.ChaoticEvil]: "Chaotic Evil",
            [Alignment.ChaoticGood]: "Chaotic Good",
            [Alignment.ChaoticNeutral]: "Chaotic Neutral",
            [Alignment.LawfulEvil]: "Lawful Evil",
            [Alignment.LawfulGood]: "Lawful Good",
            [Alignment.LawfulNeutral]: "Lawful Neutral",
            [Alignment.NeutralEvil]: "Neutral Evil",
            [Alignment.NeutralGood]: "Neutral Good",
            [Alignment.TrueNeutral]: "True Neutral"
        }
    } satisfies IOptionType<typeof Alignment>,
    "attr": {
        enum: Attribute,
        default: Attribute.STR,
        options: {
            [Attribute.STR]: "STR",
            [Attribute.DEX]: "DEX",
            [Attribute.CON]: "CON",
            [Attribute.INT]: "INT",
            [Attribute.WIS]: "WIS",
            [Attribute.CHA]: "CHA"
        }
    } satisfies IOptionType<typeof Attribute>,
    "dice": {
        enum: DiceType,
        default: DiceType.None,
        options: {
            [DiceType.None]: "None",
            [DiceType.D4]: "D4",
            [DiceType.D6]: "D6",
            [DiceType.D8]: "D8",
            [DiceType.D10]: "D10",
            [DiceType.D12]: "D12",
            [DiceType.D20]: "D20",
            [DiceType.D100]: "D100"
        }
    } satisfies IOptionType<typeof DiceType>,
    "movement": {
        enum: MovementType,
        default: MovementType.Walk,
        options: {
            [MovementType.Burrow]: "Burrow",
            [MovementType.Climb]: "Climb",
            [MovementType.Fly]: "Fly",
            [MovementType.Hover]: "Hover",
            [MovementType.Swim]: "Swim",
            [MovementType.Walk]: "Walk"
        }
    } satisfies IOptionType<typeof MovementType>,
    "skill": {
        enum: Skill,
        default: Skill.Acrobatics,
        options: {
            [Skill.Acrobatics]: "Acrobatics",
            [Skill.AnimalHandling]: "Animal Handling",
            [Skill.Arcana]: "Arcana",
            [Skill.Athletics]: "Athletics",
            [Skill.Deception]: "Deception",
            [Skill.History]: "History",
            [Skill.Insight]: "Insight",
            [Skill.Intimidation]: "Intimidation",
            [Skill.Investigation]: "Investigation",
            [Skill.Medicine]: "Medicine",
            [Skill.Nature]: "Nature",
            [Skill.Perception]: "Perception",
            [Skill.Performance]: "Performance",
            [Skill.Persuasion]: "Persuasion",
            [Skill.Religion]: "Religion",
            [Skill.SleightOfHand]: "Sleight of Hand",
            [Skill.Stealth]: "Stealth",
            [Skill.Survival]: "Survival"
        }
    } satisfies IOptionType<typeof Skill>,
    "abilityType": {
        enum: AbilityType,
        default: AbilityType.Feature,
        options: {
            [AbilityType.Feature]: "Feature",
            [AbilityType.MeleeAttack]: "Melee Attack",
            [AbilityType.MeleeWeapon]: "Melee Weapon",
            [AbilityType.RangedAttack]: "Ranged Attack",
            [AbilityType.RangedWeapon]: "Ranged Weapon",
            [AbilityType.ThrownWeapon]: "Thrown Weapon"
        }
    } satisfies IOptionType<typeof AbilityType>,
    "itemType": {
        enum: ItemType,
        default: ItemType.Armor,
        options: {
            [ItemType.Armor]: "Armor",
            [ItemType.Trinket]: "Trinket",
            [ItemType.Consumable]: "Consumable",
            [ItemType.MeleeWeapon]: "Melee Weapon",
            [ItemType.RangedWeapon]: "Ranged Weapon",
            [ItemType.ThrownWeapon]: "Thrown Weapon"
        }
    } satisfies IOptionType<typeof ItemType>,
    "effectCondition": {
        enum: EffectCondition,
        default: EffectCondition.Hit,
        options: {
            [EffectCondition.None]: "None",
            [EffectCondition.Hit]: "Hit",
            [EffectCondition.Save]: "Save"
        }
    } satisfies IOptionType<typeof EffectCondition>,
    "scaling": {
        enum: ScalingType,
        default: ScalingType.None,
        options: {
            [ScalingType.None]: "None",
            [ScalingType.Finesse]: "Finesse",
            [ScalingType.SpellModifier]: "Spell Modifier",
            [ScalingType.STR]: "STR",
            [ScalingType.DEX]: "DEX",
            [ScalingType.CON]: "CON",
            [ScalingType.INT]: "INT",
            [ScalingType.WIS]: "WIS",
            [ScalingType.CHA]: "CHA"
        }
    } satisfies IOptionType<typeof ScalingType>,
    "damageType": {
        enum: DamageType,
        default: DamageType.None,
        options: {
            [DamageType.None]: "None",
            [DamageType.Special]: "Special",
            [DamageType.Acid]: "Acid",
            [DamageType.Bludgeoning]: "Bludgeoning",
            [DamageType.Cold]: "Cold",
            [DamageType.Fire]: "Fire",
            [DamageType.Force]: "Force",
            [DamageType.Lightning]: "Lightning",
            [DamageType.Necrotic]: "Necrotic",
            [DamageType.Piercing]: "Piercing",
            [DamageType.Poison]: "Poison",
            [DamageType.Psychic]: "Psychic",
            [DamageType.Radiant]: "Radiant",
            [DamageType.Slashing]: "Slashing",
            [DamageType.Thunder]: "Thunder"
        }
    } satisfies IOptionType<typeof DamageType>,
    "action": {
        enum: ActionType,
        default: ActionType.Action,
        options: {
            [ActionType.None]: "None",
            [ActionType.Action]: "Action",
            [ActionType.BonusAction]: "Bonus Action",
            [ActionType.Reaction]: "Reaction",
            [ActionType.Special]: "Special",
            [ActionType.Legendary]: "Legendary"
        }
    } satisfies IOptionType<typeof ActionType>,
    "optionalAttr": {
        enum: OptionalAttribute,
        default: OptionalAttribute.None,
        options: {
            [OptionalAttribute.None]: "None",
            [OptionalAttribute.STR]: "STR",
            [OptionalAttribute.DEX]: "DEX",
            [OptionalAttribute.CON]: "CON",
            [OptionalAttribute.INT]: "INT",
            [OptionalAttribute.WIS]: "WIS",
            [OptionalAttribute.CHA]: "CHA"
        }
    } satisfies IOptionType<typeof OptionalAttribute>,
    "gender": {
        enum: Gender,
        default: Gender.Male,
        options: {
            [Gender.Male]: "Male",
            [Gender.Female]: "Female",
            [Gender.Other]: "Other"
        }
    } satisfies IOptionType<typeof Gender>,
    "target": {
        enum: TargetType,
        default: TargetType.None,
        options: {
            [TargetType.None]: "None",
            [TargetType.Self]: "Self",
            [TargetType.Single]: "Single",
            [TargetType.Multiple]: "Multiple",
            [TargetType.Point]: "Point",
            [TargetType.Touch]: "Touch"
        }
    } satisfies IOptionType<typeof TargetType>,
    "magicSchool": {
        enum: MagicSchool,
        default: MagicSchool.Abjuration,
        options: {
            [MagicSchool.Abjuration]: "Abjuration",
            [MagicSchool.Conjuration]: "Conjuration",
            [MagicSchool.Divination]: "Divination",
            [MagicSchool.Dunamancy]: "Dunamancy",
            [MagicSchool.Enchantment]: "Enchantment",
            [MagicSchool.Evocation]: "Evocation",
            [MagicSchool.Illusion]: "Illusion",
            [MagicSchool.Necromancy]: "Necromancy",
            [MagicSchool.Transmutation]: "Transmutation"
        }
    } satisfies IOptionType<typeof MagicSchool>, 
    "castingTime": {
        enum: CastingTime,
        default: CastingTime.Action,
        options: {
            [CastingTime.Action]: "Action",
            [CastingTime.BonusAction]: "Bonus Action",
            [CastingTime.Reaction]: "Reaction",
            [CastingTime.Minute]: "Minute",
            [CastingTime.Hour]: "Hour",
            [CastingTime.Custom]: "Custom"
        }
    } satisfies IOptionType<typeof CastingTime>,
    "duration": {
        enum: Duration,
        default: Duration.Instantaneous,
        options: {
            [Duration.Instantaneous]: "Instantaneous",
            [Duration.Round]: "Round",
            [Duration.Minute]: "Minute",
            [Duration.Hour]: "Hour",
            [Duration.Day]: "Day",
            [Duration.Custom]: "Custom"
        }
    } satisfies IOptionType<typeof Duration>,
    "area": {
        enum: AreaType,
        default: AreaType.None,
        options: {
            [AreaType.None]: "None",
            [AreaType.Cone]: "Cone",
            [AreaType.Cube]: "Cube",
            [AreaType.Cylinder]: "Cylinder",
            [AreaType.Line]: "Line",
            [AreaType.Sphere]: "Sphere",
            [AreaType.Square]: "Square",
        }
    } satisfies IOptionType<typeof AreaType>,
    "calc": {
        enum: CalculationMode,
        default: CalculationMode.Auto,
        options: {
            [CalculationMode.Auto]: "Auto",
            [CalculationMode.Modify]: "Modify",
            [CalculationMode.Override]: "Override"
        }
    } satisfies IOptionType<typeof CalculationMode>,
    "armor": {
        enum: ArmorType,
        default: ArmorType.Light,
        options: {
            [ArmorType.Light]: "Light Armor",
            [ArmorType.Medium]: "Medium Armor",
            [ArmorType.Heavy]: "Heavy Armor",
            [ArmorType.Shields]: "Shields",
        }
    } satisfies IOptionType<typeof ArmorType>,
    "weaponProficiency": {
        enum: WeaponType,
        default: WeaponType.Simple,
        options: {
            [WeaponType.Simple]: "Simple Weapons",
            [WeaponType.Martial]: "Martial Weapons",
            [WeaponType.Club]: "Clubs",
            [WeaponType.Battleaxe]: "Battleaxes",
            [WeaponType.Blowgun]: "Blowguns",
            [WeaponType.Dagger]: "Daggers",
            [WeaponType.Dart]: "Darts",
            [WeaponType.Flail]: "Flails",
            [WeaponType.Greataxe]: "Greataxes",
            [WeaponType.Greatclub]: "Greatclubs",
            [WeaponType.Greatsword]: "Greatsword",
            [WeaponType.Halberd]: "Halberds",
            [WeaponType.Handaxe]: "Handaxes",
            [WeaponType.HandCrossbow]: "HandCrossbows",
            [WeaponType.HeavyCrossbow]: "Heavy Crossbows",
            [WeaponType.Javelin]: "Javelins",
            [WeaponType.Lance]: "Lances",
            [WeaponType.LightHammer]: "Light Hammers",
            [WeaponType.LightCrossbow]: "Light Crossbows",
            [WeaponType.Longbow]: "Longbows",
            [WeaponType.Longsword]: "Longswords",
            [WeaponType.Mace]: "Maces",
            [WeaponType.Maul]: "Mauls",
            [WeaponType.Net]: "Nets",
            [WeaponType.Morningstar]: "Morningstars",
            [WeaponType.Pike]: "Pikes",
            [WeaponType.Quarterstaff]: "Quarterstaffs",
            [WeaponType.Rapier]: "Rapiers",
            [WeaponType.Scimitar]: "Scimitars",
            [WeaponType.Shortsword]: "Shortswords",
            [WeaponType.Shortbow]: "Shortbows",
            [WeaponType.Sling]: "Slings",
            [WeaponType.Sickle]: "Sickles",
            [WeaponType.Spear]: "Spears",
            [WeaponType.Trident]: "Tridents",
            [WeaponType.WarPick]: "War Picks",
            [WeaponType.Warhammer]: "Warhammers",
            [WeaponType.Whip]: "Whips"
        }
    } satisfies IOptionType<typeof WeaponType>,
    "meleeWeapon": {
        enum: MeleeWeaponType,
        default: MeleeWeaponType.Battleaxe,
        options: {
            [MeleeWeaponType.Battleaxe]: "Battleaxe",
            [MeleeWeaponType.Club]: "Club",
            [MeleeWeaponType.Dagger]: "Dagger",
            [MeleeWeaponType.Flail]: "Flail",
            [MeleeWeaponType.Greataxe]: "Greataxe",
            [MeleeWeaponType.Greatclub]: "Greatclub",
            [MeleeWeaponType.Greatsword]: "Greatsword",
            [MeleeWeaponType.Halberd]: "Halberd",
            [MeleeWeaponType.Handaxe]: "Handaxe",
            [MeleeWeaponType.Javelin]: "Javelin",
            [MeleeWeaponType.Lance]: "Lance",
            [MeleeWeaponType.LightHammer]: "Light Hammer",
            [MeleeWeaponType.Longsword]: "Longsword",
            [MeleeWeaponType.Mace]: "Mace",
            [MeleeWeaponType.Maul]: "Maul",
            [MeleeWeaponType.Morningstar]: "Morningstar",
            [MeleeWeaponType.Pike]: "Pike",
            [MeleeWeaponType.Quarterstaff]: "Quarterstaff",
            [MeleeWeaponType.Rapier]: "Rapier",
            [MeleeWeaponType.Scimitar]: "Scimitar",
            [MeleeWeaponType.Shortsword]: "Shortsword",
            [MeleeWeaponType.Sickle]: "Sickle",
            [MeleeWeaponType.Spear]: "Spear",
            [MeleeWeaponType.Trident]: "Trident",
            [MeleeWeaponType.WarPick]: "War Pick",
            [MeleeWeaponType.Warhammer]: "Warhammer",
            [MeleeWeaponType.Whip]: "Whip"
        }
    } satisfies IOptionType<typeof MeleeWeaponType>,
    "thrownWeapon": {
        enum: ThrownWeaponType,
        default: ThrownWeaponType.Dagger,
        options: {
            [ThrownWeaponType.Dagger]: "Dagger",
            [ThrownWeaponType.Handaxe]: "Handaxe",
            [ThrownWeaponType.Javelin]: "Javelin",
            [ThrownWeaponType.LightHammer]: "Light Hammer",
            [ThrownWeaponType.Trident]: "Trident",
            [ThrownWeaponType.Spear]: "Spear"
        }
    } satisfies IOptionType<typeof ThrownWeaponType>,
    "rangedWeapon": {
        enum: RangedWeaponType,
        default: RangedWeaponType.Blowgun,
        options: {
            [RangedWeaponType.Blowgun]: "Blowgun",
            [RangedWeaponType.HandCrossbow]: "Hand Crossbow",
            [RangedWeaponType.HeavyCrossbow]: "Heavy Crossbow",
            [RangedWeaponType.LightCrossbow]: "Light Crossbow",
            [RangedWeaponType.Longbow]: "Longbow",
            [RangedWeaponType.Net]: "Net",
            [RangedWeaponType.Shortbow]: "Shortbow",
            [RangedWeaponType.Sling]: "Sling",
        }
    } satisfies IOptionType<typeof RangedWeaponType>,
    "language": {
        enum: Language,
        default: Language.Common,
        options: {
            [Language.Common]: "Common"
        }
    } satisfies IOptionType<typeof Language>,
    "sense": {
        enum: Sense,
        default: Sense.DarkVision,
        options: {
            [Sense.BlindSight]: "Blind Sight",
            [Sense.DarkVision]: "Dark Vision",
            [Sense.TremorSense]: "Tremor Sense",
            [Sense.TrueSight]: "True Sight"
        }
    } satisfies IOptionType<typeof Sense>,
    "tool": {
        enum: Tool,
        default: Tool.AlchemistsSupplies,
        options: {
            [Tool.AlchemistsSupplies]: "Alchemist's Supplies",
            [Tool.HerbalismKit]: "Herbalism Kit",
            [Tool.PoisonersKit]: "Poisoner's Kit",
            [Tool.ThievesTools]: "Thieve's Tools"
        }
    } satisfies IOptionType<typeof Tool>,
    "proficiencyType": {
        enum: ProficiencyType,
        default: ProficiencyType.Armor,
        options: {
            [ProficiencyType.Armor]: "Armor",
            [ProficiencyType.Weapon]: "Weapon",
            [ProficiencyType.Tool]: "Tool",
            [ProficiencyType.Language]: "Language",
            [ProficiencyType.Save]: "Save",
            [ProficiencyType.Skill]: "Skill",
        }
    } satisfies IOptionType<typeof ProficiencyType>,
    "modifierType": {
        enum: ModifierType,
        default: ModifierType.Bonus,
        options: {
            [ModifierType.Bonus]: "Bonus",
            [ModifierType.Set]: "Set",
            [ModifierType.Add]: "Add",
            [ModifierType.Remove]: "Remove",
            [ModifierType.Choice]: "Choice"
        }
    } satisfies IOptionType<typeof ModifierType>,
    "modifierSelect": {
        enum: SelectType,
        default: SelectType.Value,
        options: {
            [SelectType.Value]: "Value",
            [SelectType.Choice]: "Choice",
        }
    } satisfies IOptionType<typeof SelectType>,
    "modifierCondition": {
        enum: ModifierCondition,
        default: ModifierCondition.None,
        options: {
            [ModifierCondition.None]: "None",
        }
    } satisfies IOptionType<typeof ModifierCondition>,
    "modifierBonusTypeProperty": {
        enum: ModifierBonusTypeProperty,
        default: ModifierBonusTypeProperty.Attribute,
        options: {
            [ModifierBonusTypeProperty.AC]: "AC",
            [ModifierBonusTypeProperty.Attribute]: "Attribute",
            [ModifierBonusTypeProperty.NumHitDice]: "Number of hit dice",
            [ModifierBonusTypeProperty.Health]: "Health",
            [ModifierBonusTypeProperty.Proficiency]: "Proficiency",
            [ModifierBonusTypeProperty.Initiative]: "Initiative"
        }
    } satisfies IOptionType<typeof ModifierBonusTypeProperty>,
    "modifierAddRemoveTypeProperty": {
        enum: ModifierAddRemoveTypeProperty,
        default: ModifierAddRemoveTypeProperty.Proficiency,
        options: {
            [ModifierAddRemoveTypeProperty.Proficiency]: "Proficiency",
            [ModifierAddRemoveTypeProperty.Ability]: "Ability",
            [ModifierAddRemoveTypeProperty.Spell]: "Spell",
            [ModifierAddRemoveTypeProperty.Advantage]: "Advantage",
            [ModifierAddRemoveTypeProperty.Disadvantage]: "Disadvantage",
            [ModifierAddRemoveTypeProperty.Resistance]: "Resistance",
            [ModifierAddRemoveTypeProperty.Vulnerability]: "Vulnerability",
            [ModifierAddRemoveTypeProperty.CONImmunity]: "Condition Immunity",
            [ModifierAddRemoveTypeProperty.DMGImmunity]: "Damage Immunity"
        }
    } satisfies IOptionType<typeof ModifierAddRemoveTypeProperty>,
    "modifierSetTypeProperty": {
        enum: ModifierSetTypeProperty,
        default: ModifierSetTypeProperty.CritRange,
        options: {
            [ModifierSetTypeProperty.CritRange]: "Critical Range",
            [ModifierSetTypeProperty.SpellAttribute]: "Spell Attribute",
            [ModifierSetTypeProperty.MaxDexBonus]: "Max Dexterity Bonus"
        }
    } satisfies IOptionType<typeof ModifierSetTypeProperty>,
    "restType": {
        enum: RestType,
        default: RestType.None,
        options: {
            [RestType.None]: "None",
            [RestType.ShortRest]: "Short Rest",
            [RestType.LongRest]: "Long Rest"
        }
    } satisfies IOptionType<typeof RestType>,
    "rarity": {
        enum: Rarity,
        default: Rarity.Mundane,
        options: {
            [Rarity.Mundane]: "Mundane",
            [Rarity.Common]: "Common",
            [Rarity.Uncommon]: "Uncommon",
            [Rarity.Rare]: "Rare",
            [Rarity.VeryRare]: "Very Rare",
            [Rarity.Legendary]: "Legendary",
            [Rarity.Artifact]: "Artifact"
        }
    } satisfies IOptionType<typeof Rarity>,
    "fileTypes": {
        enum: RenderedFileType,
        default: RenderedFileType.Ability,
        options: {
            [RenderedFileType.Ability]: "Ability",
            [RenderedFileType.Character]: "Character",
            [RenderedFileType.Creature]: "Creature",
            [RenderedFileType.Class]: "Class",
            [RenderedFileType.Document]: "Document",
            [RenderedFileType.Encounter]: "Encounter",
            [RenderedFileType.Item]: "Item",
            [RenderedFileType.Spell]: "Spell"
        }
    } satisfies IOptionType<typeof RenderedFileType>
} satisfies Record<string, IOptionType<Record<string, string | number>>>

type OptionTypeKey = keyof typeof OptionTypes;

type ExtractOptionType<T> = T extends OptionTypeKey
  ? typeof OptionTypes[T]
  : IOptionType<Record<string, string | number>>;


export function getOptionType<T extends string>(key: T): ExtractOptionType<T>
export function getOptionType<T extends keyof typeof OptionTypes>(key: T): ExtractOptionType<T> {
    return OptionTypes[key] as ExtractOptionType<T>;
}

export type {
    IOptionType,
    OptionTypeKey,
    ExtractOptionType
}