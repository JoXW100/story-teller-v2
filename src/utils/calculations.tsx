import Elements from 'data/elements';
import Dice from './data/dice';
import { AreaType, Attribute, OptionalAttribute, ScalingType, TargetType } from "types/database/dnd";
import { CalculationMode } from "types/database/editor";
import { ICharacterMetadata } from "types/database/files/character";
import { ICreatureMetadata } from "types/database/files/creature";
import { getOptionType } from 'data/optionData';
import IConditionalHitEffect from 'types/database/files/iConditionalHitEffect';
import CreatureData from 'data/structures/creature';
import SpellData from 'data/structures/spell';
import ICreatureStats from 'types/database/files/iCreatureStats';

export const getAttributeModifier = (stats: ICreatureStats = {}, attr: Attribute): number => {
    return stats[attr] ? Math.ceil((Number(stats[attr] ?? 10) - 11) / 2.0) : 0
}

export const getScaling = (stats: ICreatureStats = {}, scaling: ScalingType): number => {
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

export const getEffectModifier = (metadata: IConditionalHitEffect = {}, data: ICreatureStats = {}) => {
    let mod = metadata.effectModifier?.value ?? 0
    let useProf = metadata.effectProficiency ?? false
    let prof = useProf ? data.proficiency ?? 0 : 0;
    switch (metadata.effectModifier?.type) {
        case CalculationMode.Modify:
            return getScaling(data, metadata.effectScaling) + mod + prof
        case CalculationMode.Override:
            return mod + prof
        case CalculationMode.Auto:
        default:
            return getScaling(data, metadata.effectScaling) + prof
        
    }
}

export const getSpellRange = (spell: SpellData): string => {
    let area = null;
    switch (spell.area) {
        case AreaType.Cone:
        case AreaType.Cube:
        case AreaType.Square:
        case AreaType.Sphere:
        case AreaType.Line:
            area = `${spell.areaSize}ft`;
            break;
        case AreaType.Cylinder:
            area = `${spell.areaSize}x${spell.areaHeight}ft`;
            break;
        default:
            break;
    }
    switch (spell.target) {
        case TargetType.Self:
            return area ? `Self/${area}` : "Self"
        case TargetType.Point:
            return area ? `${spell.range}ft/${area}` : `${spell.range}ft`
        case TargetType.Touch:
            return 'Touch'
        default:
        case TargetType.Single:
        case TargetType.Multiple:
            return `${spell.range}ft`
    }
}

export const getProficiency = (data: ICreatureMetadata = {}): number => {
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

export const getStats = (metadata: ICreatureMetadata = {}): ICreatureStats => {
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

export const getHealth = (metadata: ICreatureMetadata = {}): { value: number, element: JSX.Element } => {
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

export const getAC = (metadata: ICreatureMetadata): number => {
    let stats = getStats(metadata)
    switch (metadata.ac?.type) {
        case CalculationMode.Override:
            return metadata.ac.value ?? 0;
        case CalculationMode.Modify:
            let mod = getAttributeModifier(stats, Attribute.DEX);
            return 10 + mod + (metadata.ac?.value ?? 0);
        case CalculationMode.Auto:
        default:
            return 10 + getAttributeModifier(stats, Attribute.DEX);
    }
}

export const getInitiative = (metadata: ICreatureMetadata): number => {
    let stats = getStats(metadata)
    switch (metadata.initiative?.type) {
        case CalculationMode.Override:
            return metadata.initiative?.value ?? 0;
        case CalculationMode.Modify:
            let mod = getAttributeModifier(stats, Attribute.DEX);
            return mod + (metadata.initiative?.value ?? 0);
        case CalculationMode.Auto:
        default:
            return getAttributeModifier(stats, Attribute.DEX);
    }
}

export const getChallenge = (creature: CreatureData): string => {
    let fraction = creature.challenge > 0
        ? ((creature.challenge < 1) 
            ? `1/${Math.floor(1/creature.challenge)}` 
            : String(creature.challenge)) 
        : '0'
    return `${fraction} (${creature.xp} XP)`
};

export const getKeyName = (collection: string, value: string | number): string => {
    return getOptionType(collection).options[value] 
        ?? getOptionType(collection).options[getOptionType(collection).default]
}

export const getComponents = (spell: SpellData): string[] => {
    let components: string[] = []
    if (spell.componentVerbal)
        components.push('V')
    if (spell.componentSomatic)
        components.push('S')
    if (spell.componentMaterial)
        components.push('M')
    return components
}