import Elements from 'data/elements';
import React, { useEffect, useState } from 'react';
import SpellSlotToggle from 'components/common/controls/spellSlotToggle';
import { useParser } from 'utils/parser';
import { getComponents, getSpellRange } from 'utils/calculations';
import Communication from 'utils/communication';
import Localization from 'utils/localization';
import SpellData from 'data/structures/spell';
import { Attribute, DamageType, EffectCondition, TargetType } from 'types/database/dnd';
import { FileData, FileGetManyMetadataResult, FileMetadataQueryResult } from 'types/database/files';
import { SpellContent, SpellMetadata } from 'types/database/files/spell';
import { RendererObject } from 'types/database/editor';
import { DBResponse } from 'types/database';
import { RollMode } from 'types/elements';
import ICreatureStats from 'types/database/files/iCreatureStats';
import styles from 'styles/renderer.module.scss';
import Logger from 'utils/logger';

interface SpellCategory {
    [type: number]: JSX.Element[]
}

type SpellGroupsProps = React.PropsWithRef<{
    spellIds: string[]
    spellSlots: number[]
    data?: ICreatureStats
}>

type SpellProps = React.PropsWithRef<{
    metadata: SpellMetadata
    stats?: ICreatureStats
    variablesKey: string
    open: boolean
}>

type SpellFileRendererProps = React.PropsWithRef<{
    file: FileData<SpellContent,SpellMetadata,undefined>
    stats?: ICreatureStats
}>

type SpellLinkRendererProps = React.PropsWithRef<{
    file: FileMetadataQueryResult<SpellMetadata>
    stats?: ICreatureStats
}>

type SpellToggleRendererProps = React.PropsWithRef<{
    metadata: SpellMetadata, 
    stats: ICreatureStats,
    isOpen?: boolean
}>

const Spell = ({ metadata, stats, open, variablesKey }: SpellProps) => {
    let spell = new SpellData(metadata, stats)
    let description = useParser(spell.description, spell.metadata, variablesKey)
    let range = getSpellRange(spell)
    let components = getComponents(spell).map((x, i) => (
        <span key={i}
            className={styles.spellComponent} 
            tooltips={Localization.toText(`spell-component-${x}`)}
        >{x}</span>
    ))
    if (!open) {
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
                {components}
            </Elements.Block>
        </Elements.Align>
    }

    return <>
        <Elements.Align>
            <Elements.Align options={{ direction: "v", weight: "1.5" }}>
                <Elements.Bold>{spell.name}</Elements.Bold>
                {Localization.toText('spell-level-school', spell.level, spell.schoolName)}
            </Elements.Align>
            <Elements.Align options={{ direction: "v" }}>
                <div><Elements.Bold>Casting</Elements.Bold>{components}</div>
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
            { components && spell.componentMaterial && <> 
                <b>Materials: </b> {spell.materials}<br/><Elements.Line/>
            </>}
            { description }
        </>}
    </>
}

const SpellFileRenderer = ({ file, stats = {} }: SpellFileRendererProps): JSX.Element => (
    <SpellToggleRenderer metadata={file.metadata} stats={stats} isOpen={true}/>
)

const SpellToggleRenderer = ({ metadata, stats, isOpen = false }: SpellToggleRendererProps): JSX.Element => {
    const [open, setOpen] = useState(isOpen);

    const handleClick = () => {
        setOpen(!open);
    }

    return (
        <div className={styles.spell} onClick={handleClick}>
            <Spell metadata={metadata} stats={stats} open={open} variablesKey="description"/>
        </div>
    )
}

const SpellLinkRenderer = ({ file, stats }: SpellLinkRendererProps): JSX.Element => {
    return <Spell metadata={file.metadata} stats={stats} open={true} variablesKey={`$${file.id}.description`}/>
}

export const SpellGroups = ({ spellIds, spellSlots, data }: SpellGroupsProps): JSX.Element => {
    const [spells, setSpells] = useState<FileGetManyMetadataResult>([])
    const [categories, setCategories] = useState<SpellCategory>({})
    
    useEffect(() => {
        if (spellIds && spellIds.length > 0) {
            Communication.getManyMetadata(spellIds)
            .then((res: DBResponse<FileGetManyMetadataResult>) => {
                if (res.success) {
                    setSpells(res.result as FileGetManyMetadataResult)
                } else {
                    Logger.warn("SpellGroups.getManyMetadata", res.result);
                    setSpells([])
                }
            })
        } else {
            setSpells([])
        }
    }, [spellIds])

    useEffect(() => {
        let categories: Record<number, JSX.Element[]> = []
        spells.forEach((file, index) => {
            if (file.type === 'spe') {
                let level = file.metadata.level as number ?? 1
                categories[level] = [
                    ...categories[level] ?? [], 
                    <SpellToggleRenderer key={index} metadata={file.metadata} stats={data}/>
                ]
            }
        })
        setCategories(categories)
    }, [spells])
    
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

const SpellRenderer: RendererObject<SpellContent,SpellMetadata> = {
    fileRenderer: SpellFileRenderer,
    linkRenderer: SpellLinkRenderer
}

export default SpellRenderer;