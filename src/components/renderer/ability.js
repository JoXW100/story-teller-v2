import { AbilityType, Attribute, DamageType, EffectCondition, OptionalAttribute, Scaling } from '@enums/database';
import { CalculationMode } from '@enums/editor';
import Elements from 'elements';
import React, { useEffect, useMemo, useState } from 'react';
import Parser, { ParseError } from 'utils/parser';
import { FileData, AbilityContent, AbilityMetadata } from '@types/database';
import styles from 'styles/renderer.module.scss';

const getAttributeModifier = (attr) => attr ? Math.ceil((attr - 11) / 2.0) : 0 

const getScaling = (data = {}, scaling) => {
    switch (scaling) {
        case Scaling.Finesse:
            return Math.max(getScaling(data, Scaling.DEX), getScaling(data, Scaling.STR));
        case Scaling.SpellModifier:
            return data.spellAttribute === OptionalAttribute.None ? 0 : getScaling(data, data.spellAttribute)
        case Scaling.None:
            return 0;
        default:
            return data[scaling] ? getAttributeModifier(data[scaling]) : 0

    }
}
const getConditionModifier = (metadata, data = {}) => {
    var mod = metadata.conditionModifier?.value ?? 0
    var prof = data.proficiency ?? 0;
    switch (metadata.conditionModifier?.type) {
        case CalculationMode.Auto:
        default:
            return getScaling(data, metadata.conditionScaling) + prof
        case CalculationMode.Modify:
            return getScaling(data, metadata.conditionScaling) + mod + prof
        case CalculationMode.Override:
            return mod + prof
    }
}
const getEffectModifier = (metadata, data = {}) => {
    switch (metadata.effectModifier?.type) {
        case CalculationMode.Auto:
        default:
            return getScaling(data, metadata.effectScaling)
        case CalculationMode.Modify:
            return getScaling(data, metadata.effectScaling) + (metadata.effectModifier?.value ?? 0)
        case CalculationMode.Override:
            return metadata.effectModifier?.value ?? 0
    }
}

const AbilityTypes = {
    [AbilityType.Feature]: "Feature",
    [AbilityType.MeleeAttack]: "Melee Attack",
    [AbilityType.MeleeWeapon]: "Melee Weapon Attack",
    [AbilityType.RangedAttack]: "Ranged Attack",
    [AbilityType.RangedWeapon]: "Ranged Weapon Attack",
    [AbilityType.Skill]: "Skill",
    [AbilityType.Special]: "Special",
    [AbilityType.Trait]: "Trait",
}

export const BuildAbility = (metadata = {}, data = {}, content) => {
    const range = metadata.range ?? 0;
    const longRange = metadata.rangeLong ?? 0;
    const conditionMod = getConditionModifier(metadata, data);
    const effectMod = getEffectModifier(metadata, data)
    const type = AbilityTypes[metadata.type];
    switch(metadata.type) {
        case AbilityType.Feature:
        default:
            return <>
                <Elements.Header3>{ metadata.name }</Elements.Header3>
                { content }
            </>
        case AbilityType.RangedAttack:
        case AbilityType.RangedWeapon:
        case AbilityType.MeleeAttack:
        case AbilityType.MeleeWeapon:
            return <>
                <Elements.Align>
                    <div style={{ width: '50%'}}>
                        <Elements.Bold>{ metadata.name }</Elements.Bold><br/>
                        { type }
                    </div>
                    <Elements.Line/>
                    <div>
                        <div>
                            { 
                                [AbilityType.RangedAttack, AbilityType.RangedWeapon].includes(metadata.type)
                                ? <><Elements.Bold>Range </Elements.Bold> {`${range} (${longRange}) ft `}</>
                                : <><Elements.Bold>Reach </Elements.Bold> {`${range} ft`}</>
                            }
                        </div>
                        { metadata.condition === EffectCondition.Hit &&
                            <div>
                                <Elements.Bold>HIT/DC </Elements.Bold>
                                <Elements.Roll 
                                    options={{ 
                                        mod: conditionMod, 
                                        desc: `${metadata.name} Attack` 
                                    }}
                                />
                            </div>
                        }
                        { metadata.condition === EffectCondition.Save &&
                            <div>
                                <Elements.Bold>HIT/DC </Elements.Bold>
                                <Elements.Save
                                    options={{
                                        attr: metadata.saveAttr ?? Attribute.STR,
                                        value: 8 + conditionMod
                                    }}
                                />
                            </div>
                        }
                        { metadata.damageType === DamageType.None && (
                            <div>
                                <Elements.Bold>Effect </Elements.Bold>
                                { metadata.effectText }
                            </div>
                        )}
                        { metadata.damageType !== DamageType.None && (
                            <div>
                                <Elements.Bold>Damage</Elements.Bold>
                                <Elements.Roll 
                                    options={{ 
                                        dice: metadata.effectDice, 
                                        num: metadata.effectDiceNum, 
                                        mod: effectMod,
                                        mode: 'dmg',
                                        desc: `${metadata.name} Damage`
                                    }}
                                >
                                    <Elements.Icon 
                                        options={{ 
                                            icon: metadata.damageType,
                                            tooltips: Object.keys(DamageType).find((key) => DamageType[key] === metadata.damageType) 
                                        }}
                                    />
                                </Elements.Roll>
                            </div>
                        )}
                        { (metadata.notes && metadata.notes.length) > 0 && (
                            <div> <Elements.Bold>Notes </Elements.Bold> { metadata.notes } </div>
                        )}
                    </div>
                </Elements.Align>
                { content && <Elements.Line/> }
                { content }
            </>
    }
}

/**
 * @typedef AbilityData
 * @property {number} str
 * @property {number} dex
 * @property {number} con
 * @property {number} int
 * @property {number} wis
 * @property {number} cha
 * @property {number} proficiency
 * @property {string} spellAttribute
 */

/**
 * 
 * @param {{ file: FileData<AbilityContent, AbilityMetadata>, data: AbilityData }} 
 * @returns {JSX.Element}
 */
const AbilityRenderer = ({ file, data }) => {
    let metadata = file.metadata ?? {}
    const [content, setContent] = useState(null)
    const [open, setOpen] = useState(metadata.type === AbilityType.Feature);

    const handleClick = () => {
        setOpen(!open || metadata.type === AbilityType.Feature);
    }

    useEffect(() => {
        if ((metadata.description?.length ?? 0) == 0){
            setContent(null);
            return;
        }

        Parser.parse(metadata.description, metadata)
        .then((res) => setContent(res))
        .catch((error) => {
            if (error.type === ParseError.type) {
                setContent(
                    <div className={styles.error}> 
                        {error.message} 
                    </div>
                );
            }
            else {
                setContent(null);
                throw error;
            }
        })
    }, [file.metadata])

    const ability = useMemo(() => BuildAbility(metadata, data, open ? content : null), [metadata, data, content, open])

    return (
        <div className={styles.ability} onClick={handleClick}>
            { ability }
        </div>
    )
}



export default AbilityRenderer;