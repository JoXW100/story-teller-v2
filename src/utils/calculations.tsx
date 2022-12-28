import Elements from 'elements';
import Dice from './data/dice';
import { AreaType, Attribute, CastingTime, Duration, ScalingType, Skill, TargetType } from "types/database/dnd";
import { CalculationMode, OptionalAttribute } from "types/database/editor";
import { AbilityMetadata } from "types/database/files/ability";
import { CharacterMetadata, CharacterStats } from "types/database/files/character";
import { CreatureMetadata } from "types/database/files/creature";
import { SpellMetadata } from "types/database/files/spell";

export const getAttributeModifier = (stats: CharacterStats = {}, attr: Attribute): number => {
    return stats[attr] ? Math.ceil((Number(stats[attr] ?? 10) - 11) / 2.0) : 0
}

export const getScaling = (stats: CharacterStats = {}, scaling: ScalingType): number => {
    switch (scaling) {
        case ScalingType.Finesse:
            return Math.max(getScaling(stats, ScalingType.DEX), getScaling(stats, ScalingType.STR));
        case ScalingType.SpellModifier:
            return getScaling(stats, ScalingType[stats.spellAttribute] ?? ScalingType.None)
        case ScalingType.None:
            return 0;
        default:
            return stats[scaling] ? getAttributeModifier(stats, scaling as unknown as Attribute) : 0
    }
}

export const getConditionModifier = (metadata: AbilityMetadata | SpellMetadata = {}, data: CharacterStats = {}) => {
    var mod = metadata.conditionModifier?.value ?? 0
    var prof = data.proficiency ?? 0;
    switch (metadata.conditionModifier?.type) {
        case CalculationMode.Modify:
            return getScaling(data, metadata.conditionScaling) + mod + prof
        case CalculationMode.Override:
            return mod + prof
        case CalculationMode.Auto:
        default:
            return getScaling(data, metadata.conditionScaling) + prof
    }
}

export const getEffectModifier = (metadata: AbilityMetadata | SpellMetadata = {}, data: CharacterStats = {}) => {
    switch (metadata.effectModifier?.type) {
        case CalculationMode.Modify:
            return getScaling(data, metadata.effectScaling) + (metadata.effectModifier?.value ?? 0)
        case CalculationMode.Override:
            return metadata.effectModifier?.value ?? 0
        case CalculationMode.Auto:
        default:
            return getScaling(data, metadata.effectScaling)
        
    }
}

export const getCastingTime = (metadata: SpellMetadata = {}): string => {
    if (metadata.time === CastingTime.Custom)
        return metadata.timeCustom
    var time = getKeyName(CastingTime, metadata.time, CastingTime.Action)
    return metadata.timeValue > 1 
        ? `${metadata.timeValue} ${time}s`
        : `${metadata.timeValue} ${time}`
}

export const getDuration = (metadata: SpellMetadata = {}): string => {
    var time = getKeyName(Duration, metadata.duration, Duration.Instantaneous)
    if (metadata.duration === Duration.Instantaneous)
        return time;
    return metadata.durationValue > 1 
        ? `${metadata.durationValue} ${time}s`
        : `${metadata.durationValue} ${time}`
}

export const getRange = (metadata: SpellMetadata = {}): string => {
    var area = null;
    switch (metadata.area) 
    {
        case AreaType.None:
            break;
        case AreaType.Cone:
            area = `${metadata.areaSize}ft `;
            break;
        case AreaType.Cube:
            area = `${metadata.areaSize}ft `;
            break;
        case AreaType.Cylinder:
            area = `${metadata.areaSize}x${metadata.areaHeight}ft `;
            break;
        case AreaType.Line:
            area = `${metadata.areaSize}ft `;
            break;
        case AreaType.Sphere:
            area = `${metadata.areaSize}ft `;
            break;
    }
    switch (metadata.target)
    {
        case TargetType.Self:
            return area ? `Self, ${area}` : "Self"
        case TargetType.Point:
        case TargetType.Single:
            return area ? `${metadata.range}ft/${area}` : `${metadata.range}ft`
        default:
    }
}

export const getProficiency = (data: CharacterMetadata | CreatureMetadata = {}): number => {
    switch (data.proficiency?.type) {
        case CalculationMode.Override:
            return data.proficiency.value ?? 0
        case CalculationMode.Modify:
            return Math.floor((data.level ?? 0) / 4) + 2 + (data.proficiency.value ?? 0);
        case CalculationMode.Auto:
        default:
            return Math.floor((data.level ?? 0) / 4) + 2
    }
}

export const getStats = (metadata: CharacterMetadata | CreatureMetadata = {}): CharacterStats => {
    return {
        str: metadata.str ?? 10,
        dex: metadata.dex ?? 10,
        con: metadata.con ?? 10,
        int: metadata.int ?? 10,
        wis: metadata.wis ?? 10,
        cha: metadata.cha ?? 10,
        proficiency: getProficiency(metadata),
        spellAttribute: metadata.spellAttribute ?? OptionalAttribute.None
    }
}

export const getHealth = (metadata: CharacterMetadata | CreatureMetadata = {}): { value: number, element: JSX.Element } => {
    let stats = getStats(metadata)
    let dice = 0
    let mod = 0
    let lv = 0
    let total = 0
    switch (metadata.health?.type) {
        case CalculationMode.Override:
            return {
                value: metadata.health.value ?? 0,
                element: null
            }
        case CalculationMode.Modify:
            dice = metadata.hitDice ?? 0;
            mod = getAttributeModifier(stats, Attribute.CON);
            lv = metadata.level ?? 0;
            total = mod * lv + (metadata.health?.value ?? 0);
            return {
                value: Dice.average(dice, lv) + total,
                element: <Elements.Roll options={{
                    dice: dice as any, 
                    num: lv as any, 
                    mod: total as any, 
                    desc: "Health" 
                }}/>
            }
        case CalculationMode.Auto:
        default:
            dice = metadata.hitDice ?? 0;
            mod = getAttributeModifier(stats, Attribute.CON);
            lv = metadata.level ?? 0;
            total = mod * lv;
            return {
                value: Dice.average(dice, lv) + total,
                element: <Elements.Roll options={{
                    dice: dice as any, 
                    num: lv as any, 
                    mod: total as any, 
                    desc: "Health" 
                }}/>
            }
    }
}

export const getAC = (metadata: CharacterMetadata | CreatureMetadata): number => {
    var stats = getStats(metadata)
    switch (metadata.ac?.type) {
        case CalculationMode.Override:
            return metadata.ac.value ?? 0;
        case CalculationMode.Modify:
            var mod = getAttributeModifier(stats, Attribute.DEX);
            return 10 + mod + (metadata.health?.value ?? 0);
        case CalculationMode.Auto:
        default:
            return 10 + getAttributeModifier(stats, Attribute.DEX);
    }
}

export const getInitiative = (metadata: CharacterMetadata | CreatureMetadata): number => {
    var stats = getStats(metadata)
    switch (metadata.initiative?.type) {
        case CalculationMode.Override:
            return metadata.initiative?.value ?? 0;
        case CalculationMode.Modify:
            var mod = getAttributeModifier(stats, Attribute.DEX);
            return mod + (metadata.initiative?.value ?? 0);
        case CalculationMode.Auto:
        default:
            return getAttributeModifier(stats, Attribute.DEX);
    }
}

export const getChallenge = (metadata: CharacterMetadata | CreatureMetadata): string => {
    let fraction = metadata.challenge 
        ? ((metadata.challenge < 1) 
            ? `1/${Math.floor(1/metadata.challenge)}` 
            : String(metadata.challenge)) 
        : '0'
    return `${fraction} (${metadata.xp ?? 0} XP)`
};

export const getSpeed = (metadata: CharacterMetadata | CreatureMetadata): string => {
    return metadata.speed 
        ? Object.keys(metadata.speed).map((key) => `${key} ${metadata.speed[key]}ft`).join(', ')
        : ''
}

export const getSaves = (metadata: CharacterMetadata | CreatureMetadata): JSX.Element => {
    return metadata.saves && Object.keys(metadata.saves).length > 0
        ? <>{ Object.keys(metadata.saves).map((key, index) => (
                <Elements.Roll 
                    key={index} 
                    options={{ 
                        mod: metadata.saves[key] ?? 0 as any, 
                        desc: `${key.toUpperCase()} Save` 
                    }}
                > {` ${key.toUpperCase()}`} </Elements.Roll >
            ))}</>
        : null
}

export const getSkills = (metadata: CharacterMetadata | CreatureMetadata): JSX.Element => {
    return metadata.skills && Object.keys(metadata.skills).length > 0
        ? <>{ Object.keys(metadata.skills).map((key, index) => {
            var skill = Object.keys(Skill)[key] ?? null
            return skill ? (
                <Elements.Roll 
                    key={index} 
                    options={{ 
                        mod: metadata.skills[key], 
                        desc: `${skill} Check` 
                    }}
                > {` ${skill}`} </Elements.Roll>
            ) : null
        })}</>
        : null
}

export const getKeyName = (collection: {[key: string]: string }, value: string, def: string): string => {
    var cmp = value ?? def
    return Object.keys(collection).find((key) => collection[key] === cmp) ?? def
}