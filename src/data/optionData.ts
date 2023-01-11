import { AbilityType, ActionType, Alignment, AreaType, Attribute, CastingTime, CreatureType, DamageType, DiceType, Duration, EffectCondition, Gender, MagicSchool, MovementType, ScalingType, SizeType, Skill, TargetType } from 'types/database/dnd';
import { CalculationMode, OptionalAttribute } from 'types/database/editor';

interface OptionType {
    enum: any
    default: any,
    options: { [key: string]: string }
}

export const OptionTypes: { [key: string]: OptionType } = {
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
    } as OptionType,
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
    } as OptionType,
    "alignment": {
        enum: Alignment,
        default: Alignment.None,
        options: {
            [Alignment.None]: "None",
            [Alignment.Unaligned]: "Unaligned",
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
    } as OptionType,
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
    } as OptionType,
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
            [DiceType.D20]: "D20"
        }
    } as OptionType,
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
    } as OptionType,
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
    } as OptionType,
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
    } as OptionType,
    "effectCondition": {
        enum: EffectCondition,
        default: EffectCondition.None,
        options: {
            [EffectCondition.None]: "None",
            [EffectCondition.Hit]: "Hit",
            [EffectCondition.Save]: "Save"
        }
    } as OptionType,
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
    } as OptionType,
    "damageType": {
        enum: DamageType,
        default: DamageType.None,
        options: {
            [DamageType.None]: "None",
            [DamageType.Special]: "Special",
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
    } as OptionType,
    "action": {
        enum: ActionType,
        default: ActionType.None,
        options: {
            [ActionType.None]: "None",
            [ActionType.Action]: "Action",
            [ActionType.BonusAction]: "Bonus Action",
            [ActionType.Reaction]: "Reaction",
            [ActionType.Special]: "Special"
        }
    } as OptionType,
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
    } as OptionType,
    "gender": {
        enum: Gender,
        default: Gender.Male,
        options: {
            [Gender.Male]: "Male",
            [Gender.Female]: "Female",
            [Gender.Other]: "Other"
        }
    } as OptionType,
    "target": {
        enum: TargetType,
        default: TargetType.None,
        options: {
            [TargetType.None]: "None",
            [TargetType.Self]: "Self",
            [TargetType.Single]: "Single",
            [TargetType.Multiple]: "Multiple",
            [TargetType.Point]: "Point"
        }
    } as OptionType,
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
    } as OptionType, 
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
    } as OptionType,
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
    } as OptionType,
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
    } as OptionType,
    "calc": {
        enum: CalculationMode,
        default: CalculationMode.Auto,
        options: {
            [CalculationMode.Auto]: "Auto",
            [CalculationMode.Modify]: "Modify",
            [CalculationMode.Override]: "Override"
        }
    } as OptionType
}

export type {
    OptionType
}