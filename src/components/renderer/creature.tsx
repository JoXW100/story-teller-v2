import React, { useMemo, useState } from 'react';
import Elements from 'data/elements';
import RollElement from 'data/elements/roll';
import { useParser } from 'utils/parser';
import Localization from 'utils/localization';
import { AbilityGroups } from './ability';
import { SpellGroups } from './spell';
import CreatureData from 'data/structures/creature';
import AbilityData from 'data/structures/ability';
import ModifierCollectionData from 'data/structures/modifierCollection';
import { getOptionType } from 'data/optionData';
import CreatureFile, { ICreatureMetadata } from 'types/database/files/creature';
import { Attribute, OptionalAttribute, Skill } from 'types/database/dnd';
import { RendererObject } from 'types/database/editor';
import { FileMetadataQueryResult, FileGetManyMetadataResult } from 'types/database/responses';
import styles from 'styles/renderer.module.scss';
import { IModifierCollection } from 'types/database/files/modifierCollection';
import { IAbilityMetadata } from 'types/database/files/ability';

type CreatureFileRendererProps = React.PropsWithRef<{
    file: CreatureFile
}>

type CreatureLinkRendererProps = React.PropsWithRef<{
    file: FileMetadataQueryResult<ICreatureMetadata>
}>

type CreatureProficienciesPageProps = React.PropsWithRef<{
    data: CreatureData 
}>

const Pages = ["Actions", "Proficiencies"] as const

const CreatureFileRenderer = ({ file }: CreatureFileRendererProps): JSX.Element => {
    const [modifiers, setModifiers] = useState<IModifierCollection>(null)
    const [page, setPage] = useState<typeof Pages[number]>(Pages[0])
    const creature = useMemo(() => new CreatureData(file.metadata, modifiers), [file.metadata, modifiers])
    const abilities = useMemo(() => creature.abilities, [creature])
    const stats = useMemo(() => creature.getStats(), [creature])

    const content = useParser(file.content.text, creature, "$content");
    const description = useParser(creature.description, creature, "description")

    const handleAbilitiesLoaded = (abilities: FileGetManyMetadataResult<IAbilityMetadata>) => {
        let modifiersList = abilities.flatMap((ability) => new AbilityData(ability.metadata, null, String(ability.id)).modifiers);
        let collection = new ModifierCollectionData(modifiersList, null)
        if (!collection.equals(modifiers)) {
            setModifiers(collection);
        }
    }

    return (
        <>
            <Elements.Align>
                <Elements.Block>
                    <Elements.Header1> {creature.name} </Elements.Header1>
                    {`${creature.sizeText} ${creature.typeText}, ${creature.alignmentText}`}
                    <Elements.Line/>
                    <Elements.Image options={{ href: creature.portrait }}/>
                    <Elements.Line/>
                    <div><Elements.Bold>Armor Class </Elements.Bold>{creature.acValue}</div>
                    <div><Elements.Bold>Hit Points </Elements.Bold>
                        {`${creature.healthValue} `}
                        <Elements.Roll options={creature.healthRoll}/>
                    </div>
                    <div>
                        <Elements.Bold>Initiative </Elements.Bold>
                        <Elements.Roll options={{ 
                            mod: creature.initiativeValue as any, 
                            desc: "Initiative" 
                        }}/>
                    </div>
                    <div><Elements.Bold>Proficiency Bonus </Elements.Bold>
                        <RollElement options={{ 
                            mod: String(creature.proficiencyValue), 
                            desc: "Proficiency Check"
                        }}/>
                    </div>
                    <Elements.Line/>
                    <Elements.Align>
                        { Object.keys(Attribute).map((attr, index) => (
                            <div className={styles.attributeBox} key={index}>
                                <Elements.Bold>{attr}</Elements.Bold>
                                <Elements.Bold>{creature[Attribute[attr]] ?? 0}</Elements.Bold>
                                <Elements.Roll options={{
                                    mod: creature.getAttributeModifier(Attribute[attr]).toString(), 
                                    desc: `${attr} Check`,
                                    tooltips: `${attr} Check`
                                }}/>
                                <div/>
                                <Elements.Roll options={{
                                    mod: creature.getSaveModifier(Attribute[attr]).toString(), 
                                    desc: `${attr} Save`,
                                    tooltips: `${attr} Save`
                                }}/>
                            </div>
                        ))}
                    </Elements.Align>
                    <Elements.Line/>
                    <Elements.Header2>Description</Elements.Header2>
                    { description }
                    <Elements.Line/>
                    <div><Elements.Bold>Challenge </Elements.Bold>{creature.challengeText}</div>
                    { creature.resistances.length > 0 && 
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
                    }
                    <div><Elements.Bold>Speed </Elements.Bold>{creature.speedAsText}</div>
                    { Object.keys(creature.senses).length > 0 &&
                        <div><Elements.Bold>Senses </Elements.Bold>
                            {creature.sensesAsText}
                        </div>
                    }
                    <Elements.Space/>
                    <div><Elements.Bold>Passive Perception: </Elements.Bold>{creature.passivePerceptionValue.toString()}</div>
                    <div><Elements.Bold>Passive Investigation: </Elements.Bold>{creature.passiveInvestigationValue.toString()}</div>
                    <div><Elements.Bold>Passive Insight: </Elements.Bold>{creature.passiveInsightValue.toString()}</div>
                </Elements.Block>
                <Elements.Line/>
                <Elements.Block>
                    <div className={styles.pageSelector}>
                        { Object.values(Pages).map((p, index) => (
                            <button key={index} disabled={page === p} onClick={() => setPage(p)}>
                                { p }
                            </button>
                        ))}
                    </div>
                    <Elements.Line/>
                    <div className={styles.pageItem} data={page === "Actions" ? "show" : "hide"}>
                        <AbilityGroups abilityIds={abilities} stats={stats} onLoaded={handleAbilitiesLoaded}/>
                    </div>
                    <div className={styles.pageItem} data={page === "Proficiencies" ? "show" : "hide"}>
                        <CharacterProficienciesPage data={creature}/>
                    </div>
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
                        data={stats}/>
                </>
            }
            {content && <Elements.Line/>}
            {content && content}
        </>
    )
}

export const CharacterProficienciesPage = ({ data }: CreatureProficienciesPageProps): JSX.Element => {
    const skills = getOptionType("skill").options
    const attributes = getOptionType("attr").options;
    return (
        <>
            <div className={styles.skillTable}>
                <div>
                    <b>Mod</b>
                    <b>Skill</b>
                    <b>Bonus</b>
                </div>
                { Object.keys(skills).map((skill: Skill) => (
                    <div key={skill}>
                        <b>{attributes[data.getSkillAttribute(skill)]}</b>
                        <label>{skills[skill]}</label>
                        <Elements.Roll options={{
                            mod: data.getSkillModifier(skill).toString(),
                            desc: `${skills[skill]} Check`,
                            tooltips: `Roll ${skills[skill]} Check`
                        }}/>
                    </div>
                ))}
            </div>
            <Elements.Line/>
            <Elements.Header3>Armor</Elements.Header3>
            <div>{data.proficienciesArmorText}</div>
            <Elements.Header3>Weapons</Elements.Header3>
            <div>{data.proficienciesWeaponText}</div>
            <Elements.Header3>Languages</Elements.Header3>
            <div>{data.proficienciesLanguageText}</div>
            <Elements.Header3>Tools</Elements.Header3>
            <div>{data.proficienciesToolText}</div>
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
                <Elements.Header3>
                    { file.metadata?.name }
                </Elements.Header3>
                { description }
            </Elements.Block>
        </Elements.Align>
    )
}

const CreatureRenderer: RendererObject<CreatureFile> = {
    fileRenderer: CreatureFileRenderer,
    linkRenderer: CreatureLinkRenderer
}

export default CreatureRenderer;