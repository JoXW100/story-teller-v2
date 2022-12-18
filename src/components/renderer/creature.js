import React, { useContext, useEffect, useState } from 'react';
import { ActionType, Alignment, CreatureSize, CreatureType, OptionalAttribute, Skill } from '@enums/database';
import { CalculationMode } from '@enums/editor';
import { Context } from 'components/contexts/storyContext';
import Elements from 'elements';
import RollElement from 'elements/roll';
import Dice from 'utils/data/dice';
import SpellSlotToggle from '../storyPage/spellSlotToggle';
import Parser, { ParseError } from 'utils/parser';
import AbilityRenderer from './ability';
import SpellRenderer from './spell';
import styles from 'styles/renderer.module.scss';
import { FileData, CreatureContent, CreatureMetadata } from '@types/database';

const getAttributeModifier = (attr) => attr ? Math.ceil((attr - 11) / 2.0) : 0 

const getHealth = (metadata) => {
    switch (metadata.health?.type) {
        case CalculationMode.Override:
            return {
                value: metadata.health.value ?? 0,
                element: null
            }
        case CalculationMode.Modify:
            var dice = (metadata.hitDice && metadata.hitDice) ? parseInt(metadata.hitDice) : 0;
            var mod = getAttributeModifier(metadata.con);
            var lv = metadata.level ?? 0;
            var total = mod * lv + (metadata.health?.value ?? 0);
            return {
                value: Dice.average(dice, lv) + total,
                element: <Elements.Roll options={{ dice: dice, num: lv, mod: total, desc: "Health" }}/>
            }
        case CalculationMode.Auto:
        default:
            var dice = (metadata.hitDice && metadata.hitDice) ? parseInt(metadata.hitDice) : 0;
            var mod = getAttributeModifier(metadata.con);
            var lv = metadata.level ?? 0;
            var total = mod * lv;
            return {
                value: Dice.average(dice, lv) + total,
                element: <Elements.Roll options={{ dice: dice, num: lv, mod: total, desc: "Health" }}/>
            }
    }
}
const getAC = (metadata) => {
    switch (metadata.ac?.type) {
        case CalculationMode.Override:
            return metadata.ac.value ?? 0;
        case CalculationMode.Modify:
            var mod = getAttributeModifier(metadata.dex);
            return 10 + mod + (metadata.ac.value ?? 0);
        case CalculationMode.Auto:
        default:
            return 10 + getAttributeModifier(metadata.dex);
    }
}
const getProficiency = (metadata) => {
    switch (metadata.proficiency?.type) {
        case CalculationMode.Override:
            return metadata.proficiency.value ?? 0
        case CalculationMode.Modify:
            return Math.floor((metadata.level ?? 0) / 4) + 2 + (metadata.proficiency.value ?? 0);
        case CalculationMode.Auto:
        default:
            return Math.floor((metadata.level ?? 0) / 4) + 2
    }
}
const getInitiative = (metadata) => {
    switch (metadata.initiative?.type) {
        case CalculationMode.Override:
            return metadata.initiative.value ?? 0;
        case CalculationMode.Modify:
            var mod = getAttributeModifier(metadata.dex);
            return mod + (metadata.initiative.value ?? 0);
        case CalculationMode.Auto:
        default:
            return getAttributeModifier(metadata.dex);
    }
}
const getChallenge = (data) => (
    `${data.challenge 
        ? ((data.challenge < 1) 
            ? `1/${Math.floor(1/data.challenge)}` 
            : String(data.challenge)) 
        : '0'
    } (${data.xp ?? 0} XP)`
);

const AlignmentTranslation = {
    [Alignment.ChaoticEvil]: "Chaotic Evil",
    [Alignment.ChaoticGood]: "Chaotic Good",
    [Alignment.ChaoticNeutral]: "Chaotic Neutral",
    [Alignment.TrueNeutral]: "Neutral",
    [Alignment.NeutralEvil]: "Neutral Evil",
    [Alignment.NeutralGood]: "Neutral Good",
    [Alignment.LawfulEvil]: "Lawful Evil",
    [Alignment.LawfulGood]: "Lawful Good",
    [Alignment.LawfulNeutral]: "Lawful Neutral",
    [Alignment.None]: "None"
}
/**
 * @param {FileData<CreatureContent, CreatureMetadata>} file
 * @returns {JSX.Element}
 */
const useAbilities = (file) => {
    const [state, setState] = useState(null);
    const [context] = useContext(Context)
    const data = file.metadata ?? {}
    useEffect(() => {
        if (data.abilities && data.abilities.length > 0) {
            fetch(`/api/database/getManyMetadata?storyId=${context?.story?.id}&fileIds=${data.abilities}`)
            .then((res) => res.json())
            .then((res) => {
                if (res.success) {
                    setState(() => (
                        ({ data }) => {
                            if (!data)
                                return null
                            var attributes = { 
                                str: data.str, 
                                dex: data.dex, 
                                con: data.con, 
                                int: data.int, 
                                wis: data.wis,
                                cha: data.cha,
                                proficiency: getProficiency(data),
                                spellAttribute: data.spellAttribute ?? OptionalAttribute.None
                            }
                            var abilities = {
                                [ActionType.None]: { header: null, content: [] },
                                [ActionType.Action]: { header: "Actions", content: [] },
                                [ActionType.BonusAction]: { header: "Bonus Actions", content: [] },
                                [ActionType.Reaction]: { header: "Reactions", content: [] },
                                [ActionType.Special]: { header: "Special", content: [] },
                            }
                            res.result.forEach((file, index) => {
                                if (file.type === 'abi') {
                                    abilities[file.metadata.action ?? "action"].content.push(
                                        <AbilityRenderer key={index} file={file} data={attributes}/>
                                    )
                                }
                            })
                            return Object.keys(abilities).map((type) => abilities[type].content.length > 0 ? (
                                <React.Fragment key={type}>
                                    { abilities[type].header && (
                                        <Elements.Header2 options={{ underline: "true" }}>
                                            {abilities[type].header}
                                        </Elements.Header2>
                                    )}
                                    { abilities[type].content }
                                </React.Fragment>
                            ) : null)
                        }
                    ));
                } else {
                    console.warn(res.result);
                    setState(null);
                }
            })
            .catch(console.error)
        } else {
            setState(null);
        }
    }, [file.metadata.abilities])
    return state
}

/**
 * @param {FileData<CreatureContent, CreatureMetadata>} file
 * @returns {JSX.Element}
 */
const useSpells = (file) => {
    const [state, setState] = useState(null);
    const [context] = useContext(Context)
    const data = file.metadata ?? {}
    useEffect(() => {
        if (data.spells && data.spells.length > 0) {
            fetch(`/api/database/getManyMetadata?storyId=${context?.story?.id}&fileIds=${data.spells}`)
            .then((res) => res.json())
            .then((res) => {
                if (res.success) {
                    setState(() => (
                        ({ data }) => {
                            if (!data)
                                return null
                            var attributes = { 
                                str: data.str, 
                                dex: data.dex, 
                                con: data.con, 
                                int: data.int, 
                                wis: data.wis,
                                cha: data.cha,
                                proficiency: getProficiency(data),
                                spellAttribute: data.spellAttribute ?? OptionalAttribute.None
                            }
                            var spells = {}
                            res.result.forEach((file, index) => {
                                if (file.type === 'spe') {
                                    var level = file.metadata.level ?? 1
                                    spells[level] = [
                                        ...spells[level] ?? [], 
                                        <SpellRenderer key={index} file={file} data={attributes}/>
                                    ]
                                }
                            })
                            return Object.keys(spells)
                                .filter((type) => type == 0 || data.spellSlots[type - 1])
                                .map((type) => (
                                    <React.Fragment key={type}>
                                        <Elements.Row>
                                            <Elements.Bold> 
                                                {type == 0 ? 'Cantrips:' : `Level ${type}:`} 
                                            </Elements.Bold>
                                            { type > 0 && Array.from({length: data.spellSlots[type - 1] }, (_,i) => (
                                                <SpellSlotToggle key={i}/>
                                            ))}
                                        </Elements.Row>
                                        { spells[type] }
                                    </React.Fragment>
                                )
                            )
                        }
                    ));
                } else {
                    console.warn(res.result);
                    setState(null);
                }
            })
            .catch(console.error)
        } else {
            setState(null);
        }
    }, [file.metadata.spells])
    return state
}

/**
 * @param {FileData<CreatureContent, CreatureMetadata>} file
 * @returns {JSX.Element}
 */
const useContent = (file) => {
    const [state, setState] = useState(null)
    useEffect(() => {
        Parser.parse(file.content.text, file.metadata)
        .then((res) => setState(res))
        .catch((error) => {
            if (error.type === ParseError.type) {
                setState(<div className={styles.error}>{error.message}</div>);
            }
            else {
                setState(null);
                throw error;
            }
        })
    }, [file?.content?.text, file?.metadata])
    return state
}


/**
 * 
 * @param {{ file: FileData<CreatureContent, CreatureMetadata> }} 
 * @returns {JSX.Element}
 */
const CreatureRenderer = ({ file = {} }) => {
    /** @type {CreatureMetadata} */
    let data = file.metadata ?? {}
    const alignment = AlignmentTranslation[data.alignment ?? 0]
    const type = Object.keys(CreatureType).find((key) => CreatureType[key] == data.type) ?? "None"
    const size = Object.keys(CreatureSize).find((key) => CreatureSize[key] == data.size) ?? "Medium"
    const speed = data.speed && Object.keys(data.speed).map((key) => `${key} ${data.speed[key]}ft`).join(', ');
    const saves = data.saves && Object.keys(data.saves).map((key, index) => (
        <RollElement key={index} options={{ mod: data.saves[key], desc: `${key.toUpperCase()} Save` }}>
            {` ${key.toUpperCase()}`}
        </RollElement>
    ));
    const skills = data.skills && Object.keys(data.skills).map((key, index) => {
        var skill = Object.keys(Skill).find((k) => Skill[k] == key);
        return (
            <RollElement key={index} options={{ mod: data.skills[key], desc: `${skill} Check` }}>
                {` ${skill}`}
            </RollElement>
        )
    });
    const health = getHealth(data);
    const proficiency = getProficiency(data);
    const initiative = getInitiative(data);
    const challenge =  getChallenge(data);
    const Content = useContent(file);
    const Abilities = useAbilities(file);
    const Spells = useSpells(file);

    return (
        <>
            <Elements.Align>
                <Elements.Block>
                    <Elements.Header1> {data.name} </Elements.Header1>
                    {`${size} ${type}, ${alignment}`}
                    <Elements.Line/>
                    <Elements.Image options={{ href: data.portrait }}/>
                    <Elements.Line/>
                    <Elements.Header2>Description</Elements.Header2>
                    { data.description }
                    <Elements.Line/>
                    <div><Elements.Bold>Armor Class </Elements.Bold>{getAC(data)}</div>
                    <div><Elements.Bold>Hit Points </Elements.Bold>{ `${health.value} ` }{ health.element }</div>
                    <div><Elements.Bold>Speed </Elements.Bold>{ speed ?? "" }</div>
                    <div>
                        <Elements.Bold>Initiative </Elements.Bold>
                        <Elements.Roll options={{ mod: initiative ?? 0, desc: "Initiative" }}/>
                    </div>
                    <Elements.Line/>
                    <Elements.Align>
                        <Elements.Align options={{ direction: 'vc' }}>
                            <Elements.Bold>STR</Elements.Bold>
                                { data.str ?? 0 }
                            <Elements.Roll options={{ mod: getAttributeModifier(data.str), desc: "STR Check" }}/>
                        </Elements.Align>
                        <Elements.Align options={{ direction: 'vc' }}>
                            <Elements.Bold>DEX</Elements.Bold>
                                { data.dex ?? 0 }
                            <Elements.Roll options={{ mod: getAttributeModifier(data.dex), desc: "DEX Check" }}/>
                        </Elements.Align>
                        <Elements.Align options={{ direction: 'vc' }}>
                            <Elements.Bold>CON</Elements.Bold>
                                { data.con ?? 0 }
                            <Elements.Roll options={{ mod: getAttributeModifier(data.con), desc: "CON Check" }}/>
                        </Elements.Align>
                        <Elements.Align options={{ direction: 'vc' }}>
                            <Elements.Bold>INT</Elements.Bold>
                                { data.int ?? 0 }
                            <Elements.Roll options={{ mod: getAttributeModifier(data.int), desc: "INT Check" }}/>
                        </Elements.Align>
                        <Elements.Align options={{ direction: 'vc' }}>
                            <Elements.Bold>WIS</Elements.Bold>
                                { data.wis ?? 0 }
                            <Elements.Roll options={{ mod: getAttributeModifier(data.wis), desc: "WIS Check" }}/>
                        </Elements.Align>
                        <Elements.Align options={{ direction: 'vc' }}>
                            <Elements.Bold>CHA</Elements.Bold>
                                { data.cha ?? 0 }
                            <Elements.Roll options={{ mod: getAttributeModifier(data.cha), desc: "CHA Check" }}/>
                        </Elements.Align>
                    </Elements.Align>
                    <Elements.Line/>
                    <div><Elements.Bold>Saving Throws </Elements.Bold>{ saves }</div>
                    <div><Elements.Bold>Skills </Elements.Bold>{skills}</div>
                    <div><Elements.Bold>Senses </Elements.Bold>{data.senses ?? "" }</div>
                    <div><Elements.Bold>Languages </Elements.Bold>{data.languages ?? "" }</div>
                    <div><Elements.Bold>Challenge </Elements.Bold>{challenge}</div>
                    <div>
                        <Elements.Bold>Proficiency Bonus </Elements.Bold>
                        <RollElement options={{ mod: proficiency, desc: "Proficient Check" }}/>
                    </div>
                </Elements.Block>
                <Elements.Line/>
                <Elements.Block>
                    { Abilities && <Abilities data={data}/> }
                </Elements.Block>
            </Elements.Align>
            { data.spellAttribute != OptionalAttribute.None && Spells &&
                <>
                    <Elements.Line/>
                    <Elements.Header2> Spells: </Elements.Header2>
                    <Spells data={data}/>
                </>
            }
            {Content && <Elements.Line/>}
            {Content && Content}
        </>
    )
}

export const BuildCreature = (metadata) => {
    return (
        <Elements.Align>
            <Elements.Image options={{ width: '120px', href: metadata.portrait }}/>
            <Elements.Line/>
            <Elements.Block>
                <Elements.Header3>{ metadata.name }</Elements.Header3>
                { metadata.description }
            </Elements.Block>
        </Elements.Align>
    )
}

export default CreatureRenderer;