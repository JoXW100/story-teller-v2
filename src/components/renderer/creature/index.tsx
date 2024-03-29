import React, { useContext, useMemo, useState } from 'react';
import { Context } from 'components/contexts/fileContext';
import AbilityGroups from '../ability/abilityGroup';
import SpellGroups from '../spell/spellGroups';
import PageSelector from '../pageSelector';
import AttributesBox from './attributesBox';
import ProficienciesPage from './proficienciesPage';
import Elements from 'data/elements';
import RollElement from 'data/elements/roll';
import { useParser } from 'utils/parser';
import Localization from 'utils/localization';
import useCreatureHandler from 'utils/handlers/creatureHandler';
import Logger from 'utils/logger';
import { CreatureFile, ICreatureMetadata } from 'types/database/files/creature';
import { AdvantageBinding, OptionalAttribute } from 'types/database/dnd';
import { RendererObject } from 'types/database/editor';
import { FileMetadataQueryResult } from 'types/database/responses';
import { RollType } from 'types/dice';
import styles from 'styles/renderer.module.scss';

type CreatureFileRendererProps = React.PropsWithRef<{
    file: CreatureFile
}>

type CreatureLinkRendererProps = React.PropsWithRef<{
    file: FileMetadataQueryResult<ICreatureMetadata>
}>

const Pages = ["Actions", "Proficiencies"]

const CreatureFileRenderer = ({ file }: CreatureFileRendererProps): JSX.Element => {
    const [_, dispatch] = useContext(Context)
    const [page, setPage] = useState<typeof Pages[number]>(Pages[0])
    const [creature, abilities] = useCreatureHandler(file)
    const stats = useMemo(() => creature?.getStats(), [creature])
    const values = useMemo(() => creature?.getValues(), [creature])

    const content = useParser(file.content.text, creature, "$content");
    const description = useParser(creature?.description, creature, "description")

    const expendedAbilityCharges = file.storage?.abilityData ?? {}
    const expendedSpellSlots = file.storage?.spellData ?? []

    const handleSetExpendedAbilityCharges = (value: Record<string, number>) => {
        let data = Object.keys(value).reduce<Record<string, number>>((prev, key) => (
            creature.abilities.includes(key)
            ? { ...prev, [key]: value[key] } 
            : prev
        ), {})
        dispatch.setStorage("abilityData", data)
    }

    const handleSetExpendedSpellSlots = (value: number[]) => {
        dispatch.setStorage("spellData", value)
    }

    Logger.log("CreatureFileRenderer", creature)

    return (
        <>
            <Elements.Align>
                <Elements.Block>
                    <Elements.Header1>{creature.name}</Elements.Header1>
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
                            mod: String(creature.initiativeValue), 
                            desc: "Initiative",
                            type: RollType.Initiative
                        }}/>
                    </div>
                    <div><Elements.Bold>Proficiency Bonus </Elements.Bold>
                        <RollElement options={{ 
                            mod: String(creature.proficiencyValue), 
                            desc: "Proficiency Check"
                        }}/>
                    </div>
                    <Elements.Line/>
                    <AttributesBox data={creature}/>
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
                    }{ creature.advantages[AdvantageBinding.General]?.length > 0 && 
                        <div><Elements.Bold>Advantages </Elements.Bold>
                            {creature.advantages[AdvantageBinding.General]}
                        </div> 
                    }{ creature.disadvantages[AdvantageBinding.General]?.length > 0 && 
                        <div><Elements.Bold>Disadvantages </Elements.Bold>
                            {creature.disadvantages[AdvantageBinding.General]}
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
                    { creature.proficienciesLanguage.length > 0 &&
                        <div>
                            <Elements.Bold>Languages </Elements.Bold>
                            {creature.proficienciesLanguageText}
                        </div>
                    }
                    <Elements.Space/>
                    <div><Elements.Bold>Passive Perception: </Elements.Bold>{creature.passivePerceptionValue.toString()}</div>
                    <div><Elements.Bold>Passive Investigation: </Elements.Bold>{creature.passiveInvestigationValue.toString()}</div>
                    <div><Elements.Bold>Passive Insight: </Elements.Bold>{creature.passiveInsightValue.toString()}</div>
                </Elements.Block>
                <Elements.Line/>
                <Elements.Block>
                    <PageSelector pages={Pages} page={page} setPage={setPage}/>
                    <Elements.Line/>
                    <div className={styles.pageItem} data={page === "Actions" ? "show" : "hide"}>
                        <AbilityGroups 
                            abilities={abilities} 
                            stats={stats} 
                            expendedCharges={expendedAbilityCharges}
                            setExpendedCharges={handleSetExpendedAbilityCharges}
                            values={values}/>
                    </div>
                    <div className={styles.pageItem} data={page === "Proficiencies" ? "show" : "hide"}>
                        <ProficienciesPage data={creature}/>
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
                                    mod: creature.getAttributeModifier(stats.spellAttribute).toString(), 
                                    desc: Localization.toText('spell-spellModifier')
                                }}/>
                            </Elements.Align>
                            <Elements.Space/>
                            <Elements.Align options={{ direction: 'vc' }}>
                                <Elements.Bold>Spell Attack</Elements.Bold>
                                <Elements.Roll options={{ 
                                    mod: creature.spellAttackModifier.toString(),
                                    type: RollType.Attack,
                                    desc: Localization.toText('spell-spellAttack')
                                }}/>
                            </Elements.Align>
                            <Elements.Space/>
                            <Elements.Align options={{ direction: 'vc' }}>
                                <Elements.Bold>Spell Save</Elements.Bold>
                                <Elements.Save options={{
                                    dc: creature.spellSaveModifier.toString()
                                }}/>
                            </Elements.Align>
                    </Elements.Align>
                    <SpellGroups 
                        spellIds={creature.spells} 
                        spellSlots={creature.spellSlots}
                        expendedSlots={expendedSpellSlots}
                        setExpendedSlots={handleSetExpendedSpellSlots} 
                        stats={stats}/>
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