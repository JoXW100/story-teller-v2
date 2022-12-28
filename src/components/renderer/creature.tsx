import React from 'react';
import Elements from 'elements';
import RollElement from 'elements/roll';
import { useParser } from 'utils/parser';
import { getAC, getAttributeModifier, getChallenge, getHealth, getInitiative, getKeyName, getProficiency, getSaves, getSkills, getSpeed, getStats } from 'utils/calculations';
import { AbilityGroups } from './ability';
import { SpellGroups } from './spell';
import { CreatureContent, CreatureMetadata } from 'types/database/files/creature';
import { FileData, FileMetadataQueryResult } from 'types/database/files';
import { Attribute, CreatureType, SizeType } from 'types/database/dnd';
import { OptionalAttribute, RendererObject } from 'types/database/editor';
import { OptionTypes } from 'data/optionData';

type CreatureFileRendererProps = React.PropsWithRef<{
    file: FileData<CreatureContent,CreatureMetadata>
}>

type CreatureLinkRendererProps = React.PropsWithRef<{
    file: FileMetadataQueryResult<CreatureMetadata>
}>

const CreatureFileRenderer = ({ file }: CreatureFileRendererProps): JSX.Element => {
    let metadata = file.metadata ?? {}
    let alignment = OptionTypes["alignment"].options[metadata.alignment ?? OptionTypes["alignment"].default]
    let type = getKeyName(CreatureType, metadata.type, CreatureType.None)
    let size = getKeyName(SizeType, metadata.size, SizeType.Medium)
    let speed = getSpeed(metadata)
    let saves = getSaves(metadata)
    let ac = getAC(metadata)
    let skills = getSkills(metadata)
    let health = getHealth(metadata);
    let proficiency = getProficiency(metadata);
    let initiative = getInitiative(metadata);
    let challenge =  getChallenge(metadata);
    let stats = getStats(metadata)

    const Content = file.content.text ? useParser(file.content.text, file.metadata) : null;
    const Spells = <SpellGroups spellIds={metadata.spells} spellSlots={metadata.spellSlots} data={stats}/>

    return (
        <>
            <Elements.Align>
                <Elements.Block>
                    <Elements.Header1> {metadata.name} </Elements.Header1>
                    {`${size} ${type}, ${alignment}`}
                    <Elements.Line/>
                    <Elements.Image options={{ href: metadata.portrait }}/>
                    <Elements.Line/>
                    <Elements.Header2>Description</Elements.Header2>
                    { metadata.description }
                    <Elements.Line/>
                    <div><Elements.Bold>Armor Class </Elements.Bold>{ac}</div>
                    <div><Elements.Bold>Hit Points </Elements.Bold>{health.value} {health.element}</div>
                    <div><Elements.Bold>Speed </Elements.Bold>{speed}</div>
                    <div>
                        <Elements.Bold>Initiative </Elements.Bold>
                        <Elements.Roll options={{ 
                            mod: initiative as any, 
                            desc: "Initiative" 
                        }}/>
                    </div>
                    <Elements.Line/>
                    <Elements.Align>
                        { Object.keys(Attribute).map((attr, index) => (
                            <React.Fragment key={index}>
                                <Elements.Align options={{ direction: 'vc' }}>
                                    <Elements.Bold>{attr}</Elements.Bold>
                                    { metadata[Attribute[attr]] ?? 0 }
                                    <Elements.Roll options={{ 
                                        mod: getAttributeModifier(stats, Attribute[attr]) as any, 
                                        desc: `${attr} Check`
                                    }}/>
                                </Elements.Align>
                            </React.Fragment>
                        ))}
                    </Elements.Align>
                    <Elements.Line/>
                    { saves && <div><Elements.Bold>Saving Throws </Elements.Bold>{saves}</div> }
                    { skills && <div><Elements.Bold>Skills </Elements.Bold>{skills}</div> }
                    { metadata.resistances && <div><Elements.Bold>Resistances </Elements.Bold>{metadata.resistances}</div> }
                    { metadata.advantages && <div><Elements.Bold>Advantages </Elements.Bold>{metadata.advantages}</div> }
                    { metadata.dmgImmunities && <div><Elements.Bold>DMG Immunities </Elements.Bold>{metadata.dmgImmunities}</div> }
                    { metadata.conImmunities && <div><Elements.Bold>COND Immunities </Elements.Bold>{metadata.conImmunities}</div> }
                    { metadata.senses && <div><Elements.Bold>Senses </Elements.Bold>{metadata.senses}</div> }
                    { metadata.languages && <div><Elements.Bold>Languages </Elements.Bold>{metadata.languages}</div> }
                    <div><Elements.Bold>Challenge </Elements.Bold>{challenge}</div>
                    <div>
                        <Elements.Bold>Proficiency Bonus </Elements.Bold>
                        <RollElement options={{ mod: String(proficiency), desc: "Proficient Check" }}/>
                    </div>
                </Elements.Block>
                <Elements.Line/>
                <Elements.Block>
                    <AbilityGroups abilityIds={metadata?.abilities} data={stats}/>
                </Elements.Block>
            </Elements.Align>
            { metadata.spellAttribute != OptionalAttribute.None && Spells &&
                <>
                    <Elements.Line/>
                    <Elements.Header2> Spells: </Elements.Header2>
                    { Spells }
                </>
            }
            {Content && <Elements.Line/>}
            {Content && Content}
        </>
    )
}

const CreatureLinkRenderer = ({ file }: CreatureLinkRendererProps): JSX.Element => {
    return (
        <Elements.Align>
            <Elements.Image options={{ width: '120px', href: file.metadata.portrait }}/>
            <Elements.Line/>
            <Elements.Block>
                <Elements.Header3>{ file.metadata.name }</Elements.Header3>
                { file.metadata.description }
            </Elements.Block>
        </Elements.Align>
    )
}

const CreatureRenderer: RendererObject<CreatureContent,CreatureMetadata> = {
    fileRenderer: CreatureFileRenderer,
    linkRenderer: CreatureLinkRenderer
}

export default CreatureRenderer;