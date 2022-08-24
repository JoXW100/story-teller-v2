import { AbilityType, Attribute, DamageType, EffectCondition, OptionalAttribute, Scaling } from '@enums/database';
import { CalculationMode } from '@enums/editor';
import Elements from 'elements';
import React, { useEffect, useMemo, useState } from 'react';
import Parser, { ParseError } from 'utils/parser';
import styles from 'styles/storyPage/renderer.module.scss';


const getAttributeModifier = (attr) => attr ? Math.ceil((attr - 11) / 2.0) : 0 

const getScaling = (data = {}, scaling) => {
    console.log(data);
    switch (scaling) {
        case Scaling.Finesse:
            return Math.max(getScaling(data, Scaling.DEX), getScaling(data, Scaling.STR));
        case Scaling.SpellModifier:
            return data.spellAttribute === OptionalAttribute.None ? 0 : getScaling(data, data.spellAttribute)
        case Scaling.None:
            return 0;
        default:
            return getAttributeModifier(data[scaling] ?? 0)

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

const getEffectModifier = (metadata, data) => {
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

export const BuildAbility = (metadata, data, content) => {
    const range = metadata.range ?? 0;
    const longRange = metadata.rangeLong ?? 0;
    const conditionMod = getConditionModifier(metadata, data);
    const effectMod = getEffectModifier(metadata, data)
    const type = {
        [AbilityType.Feature]: "Feature",
        [AbilityType.MeleeAttack]: "Melee Attack",
        [AbilityType.MeleeWeapon]: "Melee Weapon Attack",
        [AbilityType.RangedAttack]: "Ranged Attack",
        [AbilityType.RangedWeapon]: "Ranged Weapon Attack",
        [AbilityType.Skill]: "Skill",
        [AbilityType.Special]: "Special",
        [AbilityType.Trait]: "Trait",
    }[metadata.type];
    const notes = (metadata.notes && metadata.notes.length) > 0 ? (
        <div> <b>Notes </b> { metadata.notes } </div>
    ) : null
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
                    <div style={{ width: '140px'}}>
                        <Elements.Header3>{ metadata.name }</Elements.Header3>
                        { type }
                    </div>
                    <Elements.Line/>
                    <div>
                        <div>
                            { 
                                [AbilityType.RangedAttack, AbilityType.RangedWeapon].includes(metadata.type)
                                ? <><b>Range </b> {`${range} (${longRange}) ft `}</>
                                : <><b>Reach </b> {`${range} ft`}</>
                            }
                        </div>
                        { (metadata.condition ?? EffectCondition.Hit) === EffectCondition.Hit &&
                            <div>
                                <b>HIT/DC </b>
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
                                <b>HIT/DC </b>
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
                                <b>Effect </b>
                                { metadata.effectText }
                            </div>
                        )}
                        { metadata.damageType !== DamageType.None && (
                            <div>
                                <b>Damage </b>
                                <Elements.Roll 
                                    options={{ 
                                        dice: metadata.effectDice, 
                                        num: metadata.effectDiceNum, 
                                        mod: effectMod, 
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
                        { notes }
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
 * @param {{ metadata: import('@types/database').AbilityMetadata , data: AbilityData }} 
 * @returns {JSX.Element}
 */
const AbilityRenderer = ({ metadata, data }) => {
    const [content, setContent] = useState(null)

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
    }, [metadata])

    const ability = useMemo(() => BuildAbility(metadata, data, content), [metadata, data, content])

    return (
        <div className={styles.ability}>
            { ability }
        </div>
    )
}



export default AbilityRenderer;