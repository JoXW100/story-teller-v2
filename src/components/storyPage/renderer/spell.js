import { AbilityArea, AbilityTarget, Attribute, CastingTime, DamageType, Duration, EffectCondition, MagicSchool, OptionalAttribute, Scaling } from '@enums/database';
import { CalculationMode } from '@enums/editor';
import Elements from 'elements';
import React, { useEffect, useMemo, useState } from 'react';
import Parser, { ParseError } from 'utils/parser';
import styles from 'styles/storyPage/renderer.module.scss';


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

const getCastingTime = (metadata) => {
    if (metadata.time === CastingTime.Custom)
        return metadata.timeCustom
    var time = Object.keys(CastingTime).find((x) => CastingTime[x] == metadata.time)
    return metadata.timeValue > 1 
        ? `${metadata.timeValue} ${time}s`
        : `${metadata.timeValue} ${time}`
}

const getDuration = (metadata) => {
    var time = Object.keys(Duration).find((x) => Duration[x] == metadata.duration)
    if (metadata.duration === Duration.Instantaneous)
        return time;
    return metadata.durationValue > 1 
        ? `${metadata.durationValue} ${time}s`
        : `${metadata.durationValue} ${time}`
}

const getRange = (metadata) => {
    var area = null;
    switch (metadata.area) 
    {
        case AbilityArea.None:
            break;
        case AbilityArea.Cone:
            area = `${metadata.areaSize}ft `;
            break;
        case AbilityArea.Cube:
            area = `${metadata.areaSize}ft `;
            break;
        case AbilityArea.Cylinder:
            area = `${metadata.areaSize}x${metadata.areaHeight}ft `;
            break;
        case AbilityArea.Line:
            area = `${metadata.areaSize}ft `;
            break;
        case AbilityArea.Sphere:
            area = `${metadata.areaSize}ft `;
            break;
    }
    switch (metadata.target)
    {
        case AbilityTarget.Self:
            return area ? `Self, ${area}` : "Self"
        case AbilityTarget.Point:
        case AbilityTarget.Single:
            return area ? `${metadata.range}ft/${area}` : `${metadata.range}ft`
        default:
    }
}

const getAreaIcon = (metadata) => {
    var name = Object.keys(AbilityArea).find((x) => AbilityArea[x] == metadata.area)
    return <Elements.Icon options={{ icon: metadata.area, tooltips: name }}/>
}

export const BuildSpell = (metadata = {}, data = {}, content) => {
    const conditionMod = getConditionModifier(metadata, data);
    const effectMod = getEffectModifier(metadata, data)
    const school = Object.keys(MagicSchool).find((x) => MagicSchool[x] == metadata.school)
    const castingTime = getCastingTime(metadata);
    const duration = getDuration(metadata);
    const range = getRange(metadata)
    const areaIcon = getAreaIcon(metadata)
    return (
        <>
            <Elements.Align>
                <Elements.Align options={{ direction: "v", weight: "1.5" }}>
                    <Elements.Bold> {metadata.name} </Elements.Bold>
                    {`Level ${metadata.level}, ${school}`}
                </Elements.Align>
                <Elements.Align options={{ direction: "v" }}>
                    <Elements.Bold> Casting Time </Elements.Bold>
                    {castingTime}
                </Elements.Align>
                <Elements.Align options={{ direction: "v" }}>
                    <Elements.Bold> Duration </Elements.Bold>
                    { metadata.concentration ? `${duration} (C)` : duration }
                </Elements.Align>
                { metadata.target !== AbilityTarget.None &&
                    <Elements.Align options={{ direction: "v" }}>
                        <div className={styles.spellAreaRow}>
                            <Elements.Bold> Range/Area </Elements.Bold>
                            {areaIcon}
                        </div>
                        {range}
                    </Elements.Align>
                }
                { metadata.condition === EffectCondition.Hit &&
                    <Elements.Align options={{ direction: "v", weight: "0.85"  }}>
                        <Elements.Bold>HIT/DC </Elements.Bold>
                        <Elements.Roll 
                            options={{ 
                                mod: conditionMod, 
                                desc: `${metadata.name} Attack` 
                            }}
                        />
                    </Elements.Align>
                }
                { metadata.condition === EffectCondition.Save &&
                    <Elements.Align options={{ direction: "v", weight: "0.85"  }}>
                        <Elements.Bold>HIT/DC </Elements.Bold>
                        <Elements.Save
                            options={{
                                attr: metadata.saveAttr ?? Attribute.STR,
                                value: 8 + conditionMod
                            }}
                        />
                    </Elements.Align>
                }
                { metadata.damageType === DamageType.None && (
                    <Elements.Align options={{ direction: "v", weight: "0.7"  }}>
                        <Elements.Bold>Effect </Elements.Bold>
                        { metadata.effectText }
                    </Elements.Align>
                )}
                { metadata.damageType !== DamageType.None && (
                    <Elements.Align options={{ direction: "v", weight: "0.7" }}>
                        <Elements.Bold>Damage </Elements.Bold>
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
                    </Elements.Align >
                )}
            </Elements.Align>
            { content && <Elements.Line/> }
            { content }
        </>
    )
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
 * @param {{ metadata: import('@types/database').AbilityMetadata, data: AbilityData }} 
 * @returns {JSX.Element}
 */
const SpellRenderer = ({ metadata, data }) => {
    const [content, setContent] = useState(null)
    const [open, setOpen] = useState(false);

    const handleClick = () => {
        setOpen(!open);
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
    }, [metadata])

    const ability = useMemo(() => BuildSpell(metadata, data, open ? content : null), [metadata, data, content, open])

    return (
        <div className={styles.spell} onClick={handleClick}>
            { ability }
        </div>
    )
}



export default SpellRenderer;