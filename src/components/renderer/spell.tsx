import React, { useEffect, useMemo, useState } from 'react';
import { useParser } from 'utils/parser';
import { getComponents, getSpellRange } from 'utils/calculations';
import Communication from 'utils/communication';
import Localization from 'utils/localization';
import Logger from 'utils/logger';
import { isObjectId } from 'utils/helpers';
import SpellData from 'data/structures/spell';
import Elements from 'data/elements';
import EffectRenderer from './effect';
import ChargesRenderer from 'components/renderer/chargeToggle';
import { Attribute, EffectCondition, TargetType } from 'types/database/dnd';
import { RendererObject } from 'types/database/editor';
import { DBResponse, ObjectId, ObjectIdText } from 'types/database';
import ICreatureStats from 'types/database/files/iCreatureStats';
import SpellFile, { ISpellMetadata } from 'types/database/files/spell';
import { FileGetManyMetadataResult, FileMetadataQueryResult } from 'types/database/responses';
import { FileType } from 'types/database/files';
import styles from 'styles/renderer.module.scss';

type SpellGroupsProps = React.PropsWithRef<{
    spellIds: ObjectIdText[]
    spellSlots: number[]
    expendedSlots: number[]
    stats?: ICreatureStats
    setExpendedSlots: (value: number[]) => void
}>

type SpellProps = React.PropsWithRef<{
    metadata: ISpellMetadata
    stats?: ICreatureStats
    variablesKey: string
}>

type SpellFileRendererProps = React.PropsWithRef<{
    file: SpellFile
    stats?: ICreatureStats
}>

type SpellLinkRendererProps = React.PropsWithRef<{
    file: FileMetadataQueryResult<ISpellMetadata>
    stats?: ICreatureStats
}>

type SpellToggleRendererProps = React.PropsWithRef<{
    metadata: ISpellMetadata, 
    stats: ICreatureStats,
    isOpen?: boolean
}>

const Spell = ({ metadata, stats, variablesKey }: SpellProps) => {
    let spell = useMemo(() => new SpellData(metadata, stats), [metadata, stats])
    let description = useParser(spell.description, spell, variablesKey)
    let range = getSpellRange(spell)
    let components = getComponents(spell)

    Logger.log("Spell", "Spell")

    return <>
        <Elements.Align>
            <Elements.Align options={{ direction: "v", weight: "1.5" }}>
                <Elements.Bold>{spell.name}</Elements.Bold>
                { spell.level > 0 
                    ? Localization.toText('spell-level-school', spell.level, spell.schoolName)
                    : `Cantrip, ${spell.schoolName}`
                }
            </Elements.Align>
            <Elements.Align options={{ direction: "v" }}>
                <div><Elements.Bold>Casting</Elements.Bold>
                    {components.map((x, i) => (
                        <span key={i}
                            className={styles.spellComponent} 
                            tooltips={Localization.toText(`spell-component-${x}`)}>
                            {x}
                        </span>
                    ))}
                </div>
                <div className={styles.iconRow}>
                    {spell.timeText} 
                    {spell.ritual && 
                        <Elements.Icon options={{
                            icon: 'ritual',
                            tooltips: Localization.toText('spell-ritual')  
                        }}/>
                    }
                </div>
                <Elements.Bold> Duration </Elements.Bold>
                <div className={styles.iconRow}>
                    {spell.durationText} 
                    {spell.concentration &&
                        <Elements.Icon options={{
                            icon: 'concentration',
                            tooltips: Localization.toText('spell-concentration')  
                        }}/>
                    }
                </div>
            </Elements.Align>
            <Elements.Align options={{ direction: "v" }}>
                <div className={styles.iconRow}>
                    <Elements.Bold>Range/Area</Elements.Bold>
                    {spell.target != TargetType.None &&
                        <Elements.Icon options={{ 
                            icon: spell.area, tooltips: spell.areaName 
                        }}/>
                    }
                </div>
                {spell.target != TargetType.None ? range : '-'}
                <Elements.Bold> Notes </Elements.Bold>
                <div className={styles.iconRow}>
                    {spell.notes.length > 0 ? spell.notes : '-'}
                </div>
            </Elements.Align>
            <Elements.Align options={{ direction: "v", weight: "1.2" }}>
                <div className={styles.iconRow}>
                    <Elements.Bold>HIT/DC </Elements.Bold>
                    {spell.condition == EffectCondition.Hit && 
                        <Elements.Roll 
                            options={{ 
                                mod: spell.conditionModifierValue as any, 
                                desc: `${spell.name} Attack` 
                            }}
                        />
                    }{spell.condition == EffectCondition.Save &&
                        <Elements.Save
                            options={{
                                attr: spell.saveAttr ?? Attribute.STR,
                                dc: String(8 + spell.conditionModifierValue)
                            }}
                        />
                    }{spell.condition == EffectCondition.None && '-'}
                </div>
                {spell.effects.map((effect) => (
                    <EffectRenderer key={effect.id} data={effect} stats={stats} id={variablesKey}/>
                ))}
            </Elements.Align>
        </Elements.Align>
        { (description || components) && <>
            <Elements.Line/>
            { components.length > 0 && spell.componentMaterial && <> 
                <b>Materials: </b> {spell.materials}<br/><Elements.Line/>
            </>}
            { description }
        </>}
    </>
}

const CollapsedSpell =({ metadata, stats }: SpellProps) => {
    const spell = useMemo(() => new SpellData(metadata, stats), [metadata, stats])
    const range = getSpellRange(spell)
    const components = getComponents(spell)
    
    Logger.log("Spell", "CollapsedSpell")

    return <Elements.Align>
        <Elements.Block options={{ weight: "1.5" }}>
            <div className={styles.iconRow}>
                <Elements.Bold>{spell.name}</Elements.Bold>
                {spell.concentration &&
                    <Elements.Icon options={{
                        icon: 'concentration',
                        tooltips: Localization.toText('spell-concentration')  
                    }}/>
                }
                {spell.ritual && 
                    <Elements.Icon options={{
                        icon: 'ritual',
                        tooltips: Localization.toText('spell-ritual')  
                    }}/>
                }
            </div>
        </Elements.Block>
        <Elements.Block options={{ weight: "0.8" }}>
            {spell.timeText}
        </Elements.Block>
        <Elements.Block options={{ weight: "0.8" }}>
            {spell.durationText}
        </Elements.Block>
        <Elements.Block options={{ weight: "0.8" }}>
            <div className={styles.iconRow}>
                {spell.target != TargetType.None ? range : '-'}
                {spell.target != TargetType.None &&
                    <Elements.Icon options={{ 
                        icon: spell.area, tooltips: spell.areaName 
                    }}/>
                }
            </div>
        </Elements.Block>
        <Elements.Block options={{ weight: "0.6" }}>
            {components.map((x, i) => (
                <span key={i}
                    className={styles.spellComponent} 
                    tooltips={Localization.toText(`spell-component-${x}`)}>
                    {x}
                </span>
            ))}
        </Elements.Block>
    </Elements.Align>
}

const SpellFileRenderer = ({ file, stats = {} }: SpellFileRendererProps): JSX.Element => (
    <SpellToggleRenderer metadata={file.metadata} stats={stats} isOpen={true}/>
)

const SpellToggleRenderer = ({ metadata, stats, isOpen = false }: SpellToggleRendererProps): JSX.Element => {
    const [open, setOpen] = useState(isOpen);

    const handleClick = () => {
        setOpen(!open);
    }

    const SpellRenderer = open 
        ? Spell
        : CollapsedSpell

    return (
        <div className={styles.spell} onClick={handleClick}>
            <SpellRenderer metadata={metadata} stats={stats} variablesKey="description"/>
        </div>
    )
}

const SpellLinkRenderer = ({ file, stats }: SpellLinkRendererProps): JSX.Element => {
    return <Spell metadata={file.metadata} stats={stats} variablesKey={`$${file.id}.description`}/>
}

export const SpellGroups = ({ spellIds, spellSlots, expendedSlots, stats, setExpendedSlots }: SpellGroupsProps): JSX.Element => {
    const [spells, setSpells] = useState<FileGetManyMetadataResult<ISpellMetadata>>([])
    const categories = useMemo(() => {
        let categories: Record<number, JSX.Element[]> = []
        spells.forEach((file, index) => {
            if (file.type === FileType.Spell) {
                let level = file.metadata?.level as number ?? 1
                categories[level] = [
                    ...categories[level] ?? [], 
                    <SpellToggleRenderer key={index} metadata={file.metadata} stats={stats}/>
                ]
            }
        })
        return categories
    }, [spells])
    
    useEffect(() => {
        if (spellIds && spellIds.length > 0) {
            let ids = spellIds.filter(spell => isObjectId(spell)) as ObjectId[]
            Communication.getManyMetadata(ids)
            .then((res: DBResponse<FileGetManyMetadataResult<ISpellMetadata>>) => {
                if (res.success) {
                    setSpells(res.result)
                } else {
                    Logger.warn("SpellGroups.getManyMetadata", res.result);
                    setSpells([])
                }
            })
        } else {
            setSpells([])
        }
    }, [spellIds])

    const handleSetExpended = (value: number, level: number) => {
        let slots = Array.from({ length: spellSlots.length }, () => 0)
        for (let i = 0; i < expendedSlots.length && i < spellSlots.length; i++) {
            slots[i] = expendedSlots[i] ?? 0
        }
        slots[level - 1] = value
        setExpendedSlots(slots)
    }
 
    Logger.log("Spell", "SpellGroups")
    
    return (
        <>
            { Array.from({ length: spellSlots.length + 1}, (_, level) => (
                <React.Fragment key={level}>
                    <Elements.Row>
                        <Elements.Bold> 
                            {level === 0 ? 'Cantrips:' : `Level ${level}:`} 
                        </Elements.Bold>
                        { level > 0 && (
                            <ChargesRenderer 
                                charges={spellSlots[level - 1]}
                                expended={expendedSlots[level - 1]}
                                setExpended={(value) => handleSetExpended(value, level)}/>
                        )}
                    </Elements.Row>
                    { categories[level] ?? <Elements.Space/> }
                </React.Fragment>
            ))}
        </>
    )
}

const SpellRenderer: RendererObject<SpellFile> = {
    fileRenderer: SpellFileRenderer,
    linkRenderer: SpellLinkRenderer
}

export default SpellRenderer;