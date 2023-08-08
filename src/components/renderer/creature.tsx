import React from 'react';
import Elements from 'data/elements';
import RollElement from 'data/elements/roll';
import { useParser } from 'utils/parser';
import { getSaves, getSkills, getSpeed } from 'utils/calculations';
import { AbilityGroups } from './ability';
import { SpellGroups } from './spell';
import CreatureData from 'data/structures/creature';
import { CreatureContent, CreatureMetadata } from 'types/database/files/creature';
import { FileData, FileMetadataQueryResult } from 'types/database/files';
import { Attribute } from 'types/database/dnd';
import { OptionalAttribute, RendererObject } from 'types/database/editor';
import styles from 'styles/renderer.module.scss';
import Localization from 'utils/localization';

type CreatureFileRendererProps = React.PropsWithRef<{
    file: FileData<CreatureContent,CreatureMetadata,undefined>
}>

type CreatureLinkRendererProps = React.PropsWithRef<{
    file: FileMetadataQueryResult<CreatureMetadata>
}>

const CreatureFileRenderer = ({ file }: CreatureFileRendererProps): JSX.Element => {
    let creature = new CreatureData(file.metadata)
    let stats = creature.getStats()
    let speed = getSpeed(creature)
    let saves = getSaves(creature)
    let skills = getSkills(creature)

    const content = useParser(file.content.text, file.metadata, "$content");
    const description = useParser(creature.description, file.metadata, "description")

    return (
        <>
            <Elements.Align>
                <Elements.Block>
                    <Elements.Header1> {creature.name} </Elements.Header1>
                    {`${creature.sizeText} ${creature.typeText}, ${creature.alignmentText}`}
                    <Elements.Line/>
                    <Elements.Image options={{ href: creature.portrait }}/>
                    <Elements.Line/>
                    <Elements.Header2>Description</Elements.Header2>
                    { description }
                    <Elements.Line/>
                    <div><Elements.Bold>Armor Class </Elements.Bold>{creature.acValue}</div>
                    <div><Elements.Bold>Hit Points </Elements.Bold>
                        {`${creature.healthValue} `}
                        <Elements.Roll options={creature.healthRoll}/>
                    </div>
                    <div><Elements.Bold>Speed </Elements.Bold>{speed}</div>
                    <div>
                        <Elements.Bold>Initiative </Elements.Bold>
                        <Elements.Roll options={{ 
                            mod: creature.initiativeValue as any, 
                            desc: "Initiative" 
                        }}/>
                    </div>
                    <Elements.Line/>
                    <Elements.Align>
                        { Object.keys(Attribute).map((attr, index) => (
                            <React.Fragment key={index}>
                                <Elements.Align options={{ direction: 'vc' }}>
                                    <Elements.Bold>{attr}</Elements.Bold>
                                    { creature[Attribute[attr]] }
                                    <Elements.Roll options={{ 
                                        mod: creature.getAttributeModifier(Attribute[attr]) as any, 
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
                    }{ creature.resistances.length > 0 && 
                        <div>
                            <Elements.Bold>Resistances </Elements.Bold>
                            {creature.resistances}
                        </div> 
                    }{ creature.advantages.length > 0 && 
                        <div><Elements.Bold>Advantages </Elements.Bold>
                            {creature.advantages}
                        </div> 
                    }{ creature.vulnerabilities.length > 0 && 
                        <div><Elements.Bold>Vulnerabilities </Elements.Bold>
                            {creature.vulnerabilities}
                        </div>
                    }{ creature.dmgImmunities.length > 0 && 
                        <div><Elements.Bold>DMG Immunities </Elements.Bold>
                            {creature.dmgImmunities}
                        </div> 
                    }{ creature.conImmunities.length > 0 && 
                        <div><Elements.Bold>COND Immunities </Elements.Bold>
                            {creature.conImmunities}
                        </div>
                    }{ creature.senses.length > 0 && 
                        <div><Elements.Bold>Senses </Elements.Bold>
                            {creature.senses}
                        </div>
                    }{ creature.languages.length > 0 && 
                        <div><Elements.Bold>Languages </Elements.Bold>
                            {creature.languages}
                        </div> 
                    }
                    <div><Elements.Bold>Challenge </Elements.Bold>{creature.challengeText}</div>
                    <div>
                        <Elements.Bold>Proficiency Bonus </Elements.Bold>
                        <RollElement options={{ 
                            mod: creature.proficiencyValue as any,
                            desc: "Proficient Check" 
                        }}/>
                    </div>
                </Elements.Block>
                <Elements.Line/>
                <Elements.Block>
                    <AbilityGroups abilityIds={creature.abilities} data={stats}/>
                </Elements.Block>
            </Elements.Align>
            { creature.spellAttribute != OptionalAttribute.None &&
                <>
                    <Elements.Line options={{ width: '3px'}}/>
                    <Elements.Align>
                            <Elements.Align options={{ weight: '3.6' }}>
                                <Elements.Header2> Spells: </Elements.Header2>
                            </Elements.Align>
                            <Elements.Align options={{ direction: 'vc' }}>
                                <Elements.Bold>Spell Modifier</Elements.Bold>
                                <Elements.Roll options={{ 
                                    mod: creature.getAttributeModifier(stats.spellAttribute) as any, 
                                    desc: Localization.toText('spell-spellModifier')
                                }}/>
                            </Elements.Align>
                            <Elements.Space/>
                            <Elements.Align options={{ direction: 'vc' }}>
                                <Elements.Bold>Spell Attack</Elements.Bold>
                                <Elements.Roll options={{ 
                                    mod: creature.spellAttackModifier as any, 
                                    desc: Localization.toText('spell-spellAttack')
                                }}/>
                            </Elements.Align>
                            <Elements.Space/>
                            <Elements.Align options={{ direction: 'vc' }}>
                                <Elements.Bold>Spell Save</Elements.Bold>
                                <Elements.Save options={{
                                    dc: creature.spellSaveModifier as any
                                }}/>
                            </Elements.Align>
                    </Elements.Align>
                    <SpellGroups 
                        spellIds={creature.spells} 
                        spellSlots={creature.spellSlots} 
                        data={stats}
                    />
                </>
            }
            {content && <Elements.Line/>}
            {content && content}
        </>
    )
}

const CreatureLinkRenderer = ({ file }: CreatureLinkRendererProps): JSX.Element => {
    const description = useParser(file.metadata?.description, file.metadata, `$${file.id}.description`)
    return (
        <Elements.Align>
            <Elements.Image options={{ width: '120px', href: file.metadata?.portrait }}/>
            <Elements.Line/>
            <Elements.Block>
                <Elements.Header3>{ file.metadata?.name }</Elements.Header3>
                { description }
            </Elements.Block>
        </Elements.Align>
    )
}

const CreatureRenderer: RendererObject<CreatureContent,CreatureMetadata> = {
    fileRenderer: CreatureFileRenderer,
    linkRenderer: CreatureLinkRenderer
}

export default CreatureRenderer;