import React from 'react';
import Elements from 'elements';
import RollElement from 'elements/roll';
import { useParser } from 'utils/parser';
import { getAC, getAttributeModifier, getChallenge, getHealth, getInitiative, getKeyName, getProficiency, getSaves, getSkills, getSpeed, getStats } from 'utils/calculations';
import { AbilityGroups } from './ability';
import { SpellGroups } from './spell';
import { OptionalAttribute, RendererObject } from 'types/database/editor';
import { FileData, FileMetadataQueryResult } from 'types/database/files';
import { CharacterContent, CharacterMetadata } from 'types/database/files/character';
import { Alignment, Attribute, CreatureType, Gender, SizeType } from 'types/database/dnd';

type CharacterFileRendererProps = React.PropsWithRef<{
    file: FileData<CharacterContent,CharacterMetadata>
}>

type CharacterLinkRendererProps = React.PropsWithRef<{
    file: FileMetadataQueryResult<CharacterMetadata>
}>

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

const CharacterFileRenderer = ({ file }: CharacterFileRendererProps): JSX.Element => {
    let metadata = file.metadata ?? {}
    let alignment = AlignmentTranslation[metadata.alignment ?? 0]
    let type = getKeyName(CreatureType, metadata.type, CreatureType.None)
    let size = getKeyName(SizeType, metadata.size, SizeType.Medium)
    let gender = getKeyName(Gender, metadata.gender, Gender.Male)
    let speed = getSpeed(metadata)
    var saves = getSaves(metadata)
    var skills = getSkills(metadata)
    var traits = metadata.traits?.join(', ');
    var health = getHealth(file.metadata ?? {});
    var ac = getAC(metadata);
    var proficiency = getProficiency(metadata);
    var initiative = getInitiative(metadata);
    var challenge = getChallenge(metadata);
    var stats = getStats(metadata)

    const Spells = <SpellGroups spellIds={metadata.spells} spellSlots={metadata.spellSlots} data={stats}/>
    const Content = useParser(file.content.text, file.metadata);

    return (
        <>
            <Elements.Align>
                <Elements.Block>
                    <Elements.Header1> {metadata.name} </Elements.Header1>
                    {`${size} ${type}, ${alignment}`}
                    <Elements.Line/>
                    <Elements.Image options={{href: metadata.portrait}}/>
                    <Elements.Line/>
                    <div><Elements.Bold>Race </Elements.Bold>{metadata.raceText}</div>
                    <div><Elements.Bold>Gender </Elements.Bold>{gender}</div>
                    <div><Elements.Bold>Age </Elements.Bold>{metadata.age}</div>
                    <div><Elements.Bold>Height </Elements.Bold>{metadata.height}</div>
                    <div><Elements.Bold>Weight </Elements.Bold>{metadata.weight}</div>
                    <div><Elements.Bold>Occupation </Elements.Bold>{metadata.occupation}</div>
                    <div><Elements.Bold>Traits </Elements.Bold>{traits}</div>
                    { metadata.appearance ? <>
                        <Elements.Line/>
                        <Elements.Header3>Appearance</Elements.Header3>
                        <Elements.Text>{metadata.appearance}</Elements.Text>
                    </> : null }
                    { metadata.description ? <>
                        <Elements.Line/>
                        <Elements.Header3>Description</Elements.Header3>
                        <Elements.Text>{metadata.description}</Elements.Text>
                    </> : null }
                    { metadata.history ? <>
                        <Elements.Line/>
                        <Elements.Header3>History</Elements.Header3>
                        <Elements.Text>{metadata.history}</Elements.Text>
                    </> : null }
                    { metadata.notes ? <>
                        <Elements.Line/>
                        <Elements.Header3>Notes</Elements.Header3>
                        <Elements.Text>{metadata.notes}</Elements.Text>
                    </> : null }
                </Elements.Block>
                <Elements.Line/>
                <Elements.Block>
                    <div><Elements.Bold>Armor Class </Elements.Bold>{ac}</div>
                    <div><Elements.Bold>Hit Points </Elements.Bold>{health.value} {health.element}</div>
                    <div><Elements.Bold>Speed </Elements.Bold>{speed}</div>
                    <div>
                        <Elements.Bold>Initiative </Elements.Bold>
                        <Elements.Roll options={{ 
                            mod: initiative as any, 
                            desc: "Initiative" }}
                        />
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
                    <div><Elements.Bold>Saving Throws </Elements.Bold>{ saves }</div>
                    <div><Elements.Bold>Skills </Elements.Bold>{skills}</div>
                    <div><Elements.Bold>Senses </Elements.Bold>{metadata.senses ?? "" }</div>
                    <div><Elements.Bold>Languages </Elements.Bold>{metadata.languages ?? "" }</div>
                    <div>
                        <Elements.Bold>Challenge </Elements.Bold>
                        {challenge}
                    </div>
                    <div>
                        <Elements.Bold>Proficiency Bonus </Elements.Bold>
                        <RollElement options={{ 
                            mod: String(proficiency), 
                            desc: "Proficient Check" 
                        }}/>
                    </div>
                    <Elements.Line/>
                    <AbilityGroups abilityIds={metadata.abilities} data={stats}/>
                </Elements.Block>
            </Elements.Align>
            { metadata.spellAttribute !== OptionalAttribute.None && Spells &&
                <>
                    <Elements.Line/>
                    <Elements.Header2> Spells: </Elements.Header2>
                    { Spells }
                </>
            }  
            {Content && <Elements.Line/>}
            {Content}
        </>
    )
}

const CharacterLinkRenderer = ({ file }: CharacterLinkRendererProps): JSX.Element => {
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

const CharacterRenderer: RendererObject<CharacterContent,CharacterMetadata> = {
    fileRenderer: CharacterFileRenderer,
    linkRenderer: CharacterLinkRenderer
}

export default CharacterRenderer;