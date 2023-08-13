import { Enum } from 'types';
import { AbilityType, ActionType, Alignment, AreaType, ArmorType, Attribute, CastingTime, CreatureType, DamageType, DiceType, Duration, EffectCondition, Gender, Language, MagicSchool, MovementType, OptionalAttribute, ProficiencyType, ScalingType, Sense, SizeType, Skill, TargetType, Tool, WeaponType } from 'types/database/dnd';
import { ModifierType, ModifierSelectType, ModifierCondition, ModifierBonusTypeProperty, ModifierAddRemoveTypeProperty, ModifierSetTypeProperty } from 'types/database/files/modifier';
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
    "effectCondition": {
        enum: EffectCondition,
        default: EffectCondition.None,
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
        default: ActionType.None,
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
    "weapon": {
        enum: WeaponType,
        default: WeaponType.Simple,
        options: {
            [WeaponType.Simple]: "Simple Weapons",
            [WeaponType.Martial]: "Martial Weapons"
        }
    } satisfies IOptionType<typeof WeaponType>,
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
            [ModifierType.Remove]: "Remove"
        }
    } satisfies IOptionType<typeof ModifierType>,
    "modifierSelect": {
        enum: ModifierSelectType,
        default: ModifierSelectType.Value,
        options: {
            [ModifierSelectType.Value]: "Value",
            [ModifierSelectType.Choice]: "Choice",
        }
    } satisfies IOptionType<typeof ModifierSelectType>,
    "modifierCondition": {
        enum: ModifierCondition,
        default: ModifierCondition.None,
        options: {
            [ModifierCondition.None]: "None",
        }
    } satisfies IOptionType<typeof ModifierCondition>,
    "modifierBonusTypeProperty": {
        enum: ModifierBonusTypeProperty,
        default: ModifierBonusTypeProperty.AC,
        options: {
            [ModifierBonusTypeProperty.AC]: "AC",
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
            [ModifierAddRemoveTypeProperty.Ability]: "Ability"
        }
    } satisfies IOptionType<typeof ModifierAddRemoveTypeProperty>,
    "modifierSetTypeProperty": {
        enum: ModifierSetTypeProperty,
        default: ModifierSetTypeProperty.CritRange,
        options: {
            [ModifierSetTypeProperty.CritRange]: "Critical Range"
        }
    } satisfies IOptionType<typeof ModifierSetTypeProperty>,
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
            [RenderedFileType.Spell]: "Spell"
        }
    }
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