import React, { useEffect, useMemo, useState } from 'react';
import { useParser } from 'utils/parser';
import { getComponents, getSpellRange } from 'utils/calculations';
import Communication from 'utils/communication';
import Localization from 'utils/localization';
import Logger from 'utils/logger';
import SpellData from 'data/structures/spell';
import Elements from 'data/elements';
import SpellSlotToggle from 'components/common/controls/spellSlotToggle';
import { Attribute, DamageType, EffectCondition, TargetType } from 'types/database/dnd';
import { RendererObject } from 'types/database/editor';
import { DBResponse, ObjectId, ObjectIdText } from 'types/database';
import { RollMode } from 'types/elements';
import ICreatureStats from 'types/database/files/iCreatureStats';
import SpellFile, { ISpellMetadata } from 'types/database/files/spell';
import { FileGetManyMetadataResult, FileMetadataQueryResult } from 'types/database/responses';
import styles from 'styles/renderer.module.scss';
import { isObjectId } from 'utils/helpers';
import { FileType } from 'types/database/files';

interface SpellCategory {
    [type: number]: JSX.Element[]
}

type SpellGroupsProps = React.PropsWithRef<{
    spellIds: ObjectIdText[]
    spellSlots: number[]
    data?: ICreatureStats
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
                {Localization.toText('spell-level-school', spell.level, spell.schoolName)}
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
            <Elements.Align options={{ direction: "v" }}>
                { spell.damageType == DamageType.None && <>
                    <Elements.Bold>Effect </Elements.Bold>
                    { spell.effectText }
                </>}{ spell.damageType != DamageType.None && <>
                    <Elements.Bold>Damage </Elements.Bold>
                    <Elements.Roll 
                        options={{ 
                            dice: spell.effectDice as any, 
                            num: spell.effectDiceNum as any, 
                            mod: spell.effectModifierValue as any, 
                            mode: RollMode.DMG,
                            desc: `${spell.name} Damage`
                        }}
                    ><Elements.Icon options={{ icon: spell.damageType, tooltips: spell.damageTypeName}}/>
                    </Elements.Roll>
                </>}
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

export const SpellGroups = ({ spellIds, spellSlots, data }: SpellGroupsProps): JSX.Element => {
    const [spells, setSpells] = useState<FileGetManyMetadataResult<ISpellMetadata>>([])
    const categories = useMemo(() => {
        let categories: Record<number, JSX.Element[]> = []
        spells.forEach((file, index) => {
            if (file.type === FileType.Spell) {
                let level = file.metadata?.level as number ?? 1
                categories[level] = [
                    ...categories[level] ?? [], 
                    <SpellToggleRenderer key={index} metadata={file.metadata} stats={data}/>
                ]
            }
        })
        return categories
    }, [spells])
    
    useEffect(() => {
        if (spellIds && spellIds.length > 0) {
            let ids = spellIds.filter(spell => isObjectId(spell)) as ObjectId[]
            Communication.getManyMetadata(ids)
            .then((res: DBResponse<FileGetManyMetadataResult>) => {
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

    Logger.log("Spell", "SpellGroups")
    
    return (
        <>
            { Array.from({ length: spellSlots.length + 1}, (_, level) => (
                <React.Fragment key={level}>
                    <Elements.Row>
                        <Elements.Bold> 
                            {level === 0 ? 'Cantrips:' : `Level ${level}:`} 
                        </Elements.Bold>
                        { level > 0 && Array.from({length: spellSlots[level - 1] }, (_,i) => (
                            <SpellSlotToggle key={i}/>
                        ))}
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