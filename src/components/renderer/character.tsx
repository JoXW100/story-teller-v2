import React from 'react';
import Elements from 'elements';
import RollElement from 'elements/roll';
import { useParser } from 'utils/parser';
import { getSaves, getSkills, getSpeed } from 'utils/calculations';
import { AbilityGroups } from './ability';
import { SpellGroups } from './spell';
import { OptionalAttribute, RendererObject } from 'types/database/editor';
import { FileData, FileMetadataQueryResult } from 'types/database/files';
import { CharacterContent, CharacterMetadata } from 'types/database/files/character';
import { Attribute } from 'types/database/dnd';
import CharacterData from 'structures/character';
import styles from 'styles/renderer.module.scss';

type CharacterFileRendererProps = React.PropsWithRef<{
    file: FileData<CharacterContent,CharacterMetadata,undefined>
}>

type CharacterLinkRendererProps = React.PropsWithRef<{
    file: FileMetadataQueryResult<CharacterMetadata>
}>

const CharacterFileRenderer = ({ file }: CharacterFileRendererProps): JSX.Element => {
    let character = new CharacterData(file.metadata)
    let stats = character.getStats()
    let speed = getSpeed(character)
    let saves = getSaves(character)
    let skills = getSkills(character)

    const Content = useParser(file.content.text, file.metadata);

    return (
        <>
            <Elements.Align>
                <Elements.Block>
                    <Elements.Header1> {character.name} </Elements.Header1>
                    {`${character.sizeText} ${character.typeText}, ${character.alignmentText}`}
                    <Elements.Line/>
                    <Elements.Image options={{href: character.portrait}}/>
                    <Elements.Line/>
                    <div><Elements.Bold>Race </Elements.Bold>{character.raceText}</div>
                    <div><Elements.Bold>Gender </Elements.Bold>{character.genderText}</div>
                    <div><Elements.Bold>Age </Elements.Bold>{character.age}</div>
                    <div><Elements.Bold>Height </Elements.Bold>{character.height}</div>
                    <div><Elements.Bold>Weight </Elements.Bold>{character.weight}</div>
                    <div><Elements.Bold>Occupation </Elements.Bold>{character.occupation}</div>
                    <div><Elements.Bold>Traits </Elements.Bold>{character.traitsText}</div>
                    { character.appearance.length > 0 ? <>
                        <Elements.Line/>
                        <Elements.Header3>Appearance</Elements.Header3>
                        <Elements.Text>{character.appearance}</Elements.Text>
                    </> : null }
                    { character.description.length > 0 ? <>
                        <Elements.Line/>
                        <Elements.Header3>Description</Elements.Header3>
                        <Elements.Text>{character.description}</Elements.Text>
                    </> : null }
                    { character.history.length > 0 ? <>
                        <Elements.Line/>
                        <Elements.Header3>History</Elements.Header3>
                        <Elements.Text>{character.history}</Elements.Text>
                    </> : null }
                    { character.notes.length > 0 ? <>
                        <Elements.Line/>
                        <Elements.Header3>Notes</Elements.Header3>
                        <Elements.Text>{character.notes}</Elements.Text>
                    </> : null }
                </Elements.Block>
                <Elements.Line/>
                <Elements.Block>
                    <div><Elements.Bold>Armor Class </Elements.Bold>{character.acValue}</div>
                    <div><Elements.Bold>Hit Points </Elements.Bold>
                        {`${character.healthValue} `}
                        <Elements.Roll options={character.healthRoll}/>
                    </div>
                    <div><Elements.Bold>Speed </Elements.Bold>{speed}</div>
                    <div>
                        <Elements.Bold>Initiative </Elements.Bold>
                        <Elements.Roll options={{ 
                            mod: character.initiativeValue as any, 
                            desc: "Initiative" }}
                        />
                    </div>
                    <Elements.Line/>
                    <Elements.Align>
                        { Object.keys(Attribute).map((attr, index) => (
                            <React.Fragment key={index}>
                                <Elements.Align options={{ direction: 'vc' }}>
                                    <Elements.Bold>{attr}</Elements.Bold>
                                    { character[Attribute[attr]] ?? 0 }
                                    <Elements.Roll options={{ 
                                        mod: character.getAttributeModifier(Attribute[attr]) as any, 
                                        desc: `${attr} Check`
                                    }}/>
                                </Elements.Align>
                            </React.Fragment>
                        ))}
                    </Elements.Align>
                    <Elements.Line/>
                    { saves && 
                        <div className={styles.spaceOutRolls}>
                            <Elements.Bold>Saving Throws </Elements.Bold>
                            {saves}
                        </div> 
                    }{ skills && 
                        <div className={styles.spaceOutRolls}>
                            <Elements.Bold>Skills </Elements.Bold>
                            {skills}
                        </div> 
                    }{ character.resistances.length > 0 && 
                        <div>
                            <Elements.Bold>Resistances </Elements.Bold>
                            {character.resistances}
                        </div> 
                    }{ character.advantages.length > 0 && 
                        <div><Elements.Bold>Advantages </Elements.Bold>
                            {character.advantages}
                        </div> 
                    }{ character.dmgImmunities.length > 0 && 
                        <div><Elements.Bold>DMG Immunities </Elements.Bold>
                            {character.dmgImmunities}
                        </div> 
                    }{ character.conImmunities.length > 0 && 
                        <div><Elements.Bold>COND Immunities </Elements.Bold>
                            {character.conImmunities}
                        </div>
                    }{ character.senses.length > 0 && 
                        <div><Elements.Bold>Senses </Elements.Bold>
                            {character.senses}
                        </div>
                    }{ character.languages.length > 0 && 
                        <div><Elements.Bold>Languages </Elements.Bold>
                            {character.languages}
                        </div> 
                    }
                    <div><Elements.Bold>Senses </Elements.Bold>{character.senses}</div>
                    <div><Elements.Bold>Languages </Elements.Bold>{character.languages}</div>
                    <div>
                        <Elements.Bold>Challenge </Elements.Bold>
                        {character.challengeText}
                    </div>
                    <div>
                        <Elements.Bold>Proficiency Bonus </Elements.Bold>
                        <RollElement options={{ 
                            mod: String(character.proficiencyValue), 
                            desc: "Proficient Check" 
                        }}/>
                    </div>
                    <Elements.Line/>
                    <AbilityGroups abilityIds={character.abilities} data={stats}/>
                </Elements.Block>
            </Elements.Align>
            { character.spellAttribute !== OptionalAttribute.None && character.spells.length > 0 &&
                <>
                    <Elements.Line/>
                    <Elements.Header2> Spells: </Elements.Header2>
                    <SpellGroups 
                        spellIds={character.spells} 
                        spellSlots={character.spellSlots} 
                        data={stats}
                    />
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
            <Elements.Image options={{ width: '120px', href: file.metadata?.portrait }}/>
            <Elements.Line/>
            <Elements.Block>
                <Elements.Header3>{ file.metadata?.name }</Elements.Header3>
                { file.metadata?.description }
            </Elements.Block>
        </Elements.Align>
    )
}

const CharacterRenderer: RendererObject<CharacterContent,CharacterMetadata> = {
    fileRenderer: CharacterFileRenderer,
    linkRenderer: CharacterLinkRenderer
}

export default CharacterRenderer;