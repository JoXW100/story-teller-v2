import { ActionType, Alignment, CreatureSize, CreatureType, Gender, OptionalAttribute, Skill } from '@enums/database';
import { CalculationMode } from '@enums/editor';
import { Context } from 'components/contexts/storyContext';
import Elements from 'elements';
import RollElement from 'elements/roll';
import React, { useContext, useEffect, useState } from 'react';
import styles from 'styles/storyPage/renderer.module.scss';
import Dice from 'utils/data/dice';
import Parser, { ParseError } from 'utils/parser';
import AbilityRenderer from './ability';


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
            return 10 + mod + (metadata.health.value ?? 0);
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

const getChallenge = (metadata) => (
    metadata.challenge 
        ? ((metadata.challenge < 1) 
            ? `1/${Math.floor(1/metadata.challenge)}` 
            : metadata.challenge) 
        : 0
);

/**
 * 
 * @param {{ metadata: import('@types/database').CreatureMetadata }} 
 * @returns {JSX.Element}
 */
const CharacterRenderer = ({ metadata = {} }) => {
    const [context] = useContext(Context)
    const alignment = {
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
    }[metadata.alignment ?? 0]
    const type = Object.keys(CreatureType).find((key) => CreatureType[key] == metadata.type) ?? "None"
    const size = Object.keys(CreatureSize).find((key) => CreatureSize[key] == metadata.size) ?? "Medium"
    const gender = Object.keys(Gender).find((key) => Gender[key] == metadata.gender) ?? "None"
    const speed = metadata.speed && Object.keys(metadata.speed).map((key) => `${key} ${metadata.speed[key]}ft`).join(', ');
    const saves = metadata.saves && Object.keys(metadata.saves).map((key, index) => (
        <RollElement key={index} options={{ mod: metadata.saves[key], desc: `${key.toUpperCase()} Save` }}>
            {` ${key.toUpperCase()}`}
        </RollElement>
    ));
    const skills = metadata.skills && Object.keys(metadata.skills).map((key, index) => {
        var skill = Object.keys(Skill).find((k) => Skill[k] == key);
        return (
            <RollElement key={index} options={{ mod: metadata.skills[key], desc: `${skill} Check` }}>
                {` ${skill}`}
            </RollElement>
        )
    });
    const traits = metadata.traits?.join(', ');
    const health = getHealth(metadata);
    const ac = getAC(metadata);
    const proficiency = getProficiency(metadata);
    const initiative = getInitiative(metadata);
    const challenge =  getChallenge(metadata);

    const [content, setContent] = useState(null);
    const [Abilities, setAbilities] = useState(null);

    useEffect(() => {
        Parser.parse(metadata.$text, metadata)
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

    useEffect(() => {
        if (metadata.abilities) {
            fetch(`/api/database/getManyMetadata?storyId=${context.story.id}&fileIds=${metadata.abilities}`)
            .then((res) => res.json())
            .then((res) => {
                if (res.success) {
                    setAbilities(() => (
                        ({ metadata }) => {
                            var data = { 
                                str: metadata.str, 
                                dex: metadata.dex, 
                                con: metadata.con, 
                                int: metadata.int, 
                                wis: metadata.wis,
                                cha: metadata.cha,
                                proficiency: proficiency,
                                spellAttribute: metadata.spellAttribute ?? OptionalAttribute.None
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
                                        <AbilityRenderer key={index} metadata={file.metadata} data={data}/>
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
                }
                else {
                    console.warn(res.result);
                    setAbilities(null);
                }
            })
            .catch(console.error)
        }
        else {
            setAbilities(null);
        }
    }, [metadata.abilities, context.story])

    return (
        <>
            <Elements.Align>
                <Elements.Block>
                    <Elements.Header1> {metadata.name} </Elements.Header1>
                    {`${size} ${type}, ${alignment}`}
                    <Elements.Line/>
                    <Elements.Image options={{ href: metadata.portrait }}/>
                    <Elements.Line/>
                    <div><b>Race </b> { metadata.raceText }</div>
                    <div><b>Gender </b> { gender }</div>
                    <div><b>Age </b> { metadata.age }</div>
                    <div><b>Height </b> { metadata.height }</div>
                    <div><b>Weight </b> { metadata.weight }</div>
                    <div><b>Occupation </b> { metadata.occupation }</div>
                    <div><b>Traits </b> { traits }</div>
                    <Elements.Line/>
                    <Elements.Header3>Appearance</Elements.Header3>
                    { metadata.appearance }
                    <Elements.Line/>
                    <Elements.Header3>Description</Elements.Header3>
                    { metadata.description }
                    <Elements.Line/>
                    <Elements.Header3>History</Elements.Header3>
                    { metadata.history }
                    <Elements.Line/>
                    <Elements.Header3>Notes</Elements.Header3>
                    { metadata.notes }
                </Elements.Block>
                <Elements.Line/>
                <Elements.Block>
                    <div><b>Armor Class </b>{ac}</div>
                    <div><b>Hit Points </b>{ `${health.value} ` }{ health.element }</div>
                    <div><b>Speed </b>{ speed ?? "" }</div>
                    <div>
                        <b>Initiative </b>
                        <Elements.Roll options={{ mod: initiative ?? 0, desc: "Initiative" }}/>
                    </div>
                    <Elements.Line/>
                    <Elements.Align>
                        <Elements.Align options={{ direction: 'vc' }}>
                            <b>STR</b>
                            { metadata.str ?? 0 }
                            <Elements.Roll options={{ mod: getAttributeModifier(metadata.str), desc: "STR Check" }}/>
                        </Elements.Align>
                        <Elements.Align options={{ direction: 'vc' }}>
                            <b>DEX</b>
                            { metadata.dex ?? 0 }
                            <Elements.Roll options={{ mod: getAttributeModifier(metadata.dex), desc: "DEX Check" }}/>
                        </Elements.Align>
                        <Elements.Align options={{ direction: 'vc' }}>
                            <b>CON</b>
                            { metadata.con ?? 0 }
                            <Elements.Roll options={{ mod: getAttributeModifier(metadata.con), desc: "CON Check" }}/>
                        </Elements.Align>
                        <Elements.Align options={{ direction: 'vc' }}>
                            <b>INT</b>
                            { metadata.int ?? 0 }
                            <Elements.Roll options={{ mod: getAttributeModifier(metadata.int), desc: "INT Check" }}/>
                        </Elements.Align>
                        <Elements.Align options={{ direction: 'vc' }}>
                            <b>WIS</b>
                            { metadata.wis ?? 0 }
                            <Elements.Roll options={{ mod: getAttributeModifier(metadata.wis), desc: "WIS Check" }}/>
                        </Elements.Align>
                        <Elements.Align options={{ direction: 'vc' }}>
                            <b>CHA</b>
                            { metadata.cha ?? 0 }
                            <Elements.Roll options={{ mod: getAttributeModifier(metadata.cha), desc: "CHA Check" }}/>
                        </Elements.Align>
                    </Elements.Align>
                    <Elements.Line/>
                    <div><b>Saving Throws </b>{ saves }</div>
                    <div><b>Skills </b>{skills}</div>
                    <div><b>Senses </b>{metadata.senses ?? "" }</div>
                    <div><b>Languages </b>{metadata.languages ?? "" }</div>
                    <div>
                        <b>Challenge </b>
                        { `${challenge} (${metadata.xp ?? 0} XP)`}
                    </div>
                    <div>
                        <b>Proficiency Bonus </b>
                        <RollElement options={{ mod: proficiency, desc: "Proficient Check" }}/>
                    </div>
                    <Elements.Line/>
                    { Abilities && <Abilities metadata={metadata}/> }
                </Elements.Block>
            </Elements.Align>
            <Elements.Line/>
            {content}
        </>
    )
}

export const BuildCharacter = (metadata) => {
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

export default CharacterRenderer;