import Elements from 'elements';
import React, { useEffect, useState } from 'react';
import SpellSlotToggle from 'components/common/spellSlotToggle';
import { useParser } from 'utils/parser';
import { getComponents, getSpellRange } from 'utils/calculations';
import { Attribute, DamageType, EffectCondition, TargetType } from 'types/database/dnd';
import { FileData, FileGetManyMetadataResult, FileMetadataQueryResult } from 'types/database/files';
import { SpellContent, SpellMetadata } from 'types/database/files/spell';
import { RendererObject } from 'types/database/editor';
import { DBResponse } from 'types/database';
import { RollMode } from 'types/elements';
import styles from 'styles/renderer.module.scss';
import Localization from 'utils/localization';
import SpellData from 'structures/spell';
import ICreatureStats from 'types/database/files/iCreatureStats';

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
    open: boolean
}>

type SpellFileRendererProps = React.PropsWithRef<{
    file: FileData<SpellContent,SpellMetadata>
    stats?: ICreatureStats
}>

type SpellLinkRendererProps = React.PropsWithRef<{
    file: FileMetadataQueryResult<SpellMetadata>
    stats?: ICreatureStats
}>

type SpellToggleRendererProps = React.PropsWithRef<{
    metadata: SpellMetadata, 
    stats: ICreatureStats
}>

const Spell = ({ metadata, stats, open }: SpellProps) => {
    let spell = new SpellData(metadata, stats)
    let description = useParser(spell.description, spell.metadata)
    let range = getSpellRange(spell)
    let components = getComponents(spell).map((x, i) => (
        <span key={i}
            className={styles.spellComponent} 
            tooltips={Localization.toText(`spell-component-${x}`)}
        >{x}</span>
    ))
    return (
        <>
            <Elements.Align>
                <Elements.Align options={{ direction: "v", weight: "1.5" }}>
                    <Elements.Bold>{spell.name}</Elements.Bold>
                    {`Level ${spell.level}, ${spell.schoolName}`}
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
            { open && (description || components) && <>
                <Elements.Line/>
                { components && spell.componentMaterial && <> 
                    <b>Materials: </b> {spell.materials}<br/><Elements.Line/>
                </>}
                { description }
            </>}
        </>
    )
}

const SpellFileRenderer = ({ file, stats = {} }: SpellFileRendererProps): JSX.Element => (
    <SpellToggleRenderer metadata={file.metadata} stats={stats}/>
)

const SpellToggleRenderer = ({ metadata, stats }: SpellToggleRendererProps): JSX.Element => {
    const [open, setOpen] = useState(false);

    const handleClick = () => {
        setOpen(!open);
    }

    return (
        <div className={styles.spell} onClick={handleClick}>
            <Spell metadata={metadata} stats={stats} open={open}/>
        </div>
    )
}

const SpellLinkRenderer = ({ file, stats }: SpellLinkRendererProps): JSX.Element => {
    return <Spell metadata={file.metadata} stats={stats} open={true}/>
}

export const SpellGroups = ({ spellIds, spellSlots, data }: SpellGroupsProps): JSX.Element => {
    const [spells, setSpells] = useState<FileGetManyMetadataResult>([])
    const [categories, setCategories] = useState<SpellCategory>({})
    
    useEffect(() => {
        if (spellIds && spellIds.length > 0) {
            fetch(`/api/database/getManyMetadata?fileIds=${spellIds}`)
            .then((res) => res.json())
            .then((res: DBResponse<FileGetManyMetadataResult>) => {
                if (res.success) {
                    setSpells(res.result as FileGetManyMetadataResult)
                } else {
                    console.warn(res.result);
                    setSpells([])
                }
            })
            .catch(console.error)
        } else {
            setSpells([])
        }
    }, [spellIds])

    useEffect(() => {
        var categories: Record<number, JSX.Element[]> = []
        spells.forEach((file, index) => {
            if (file.type === 'spe') {
                var level = file.metadata.level as number ?? 1
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
            { Object.keys(categories)
                .filter((type) => Number(type) === 0 || spellSlots[Number(type) - 1])
                .map((type) => (
                    <React.Fragment key={type}>
                        <Elements.Row>
                            <Elements.Bold> 
                                {Number(type) === 0 ? 'Cantrips:' : `Level ${type}:`} 
                            </Elements.Bold>
                            { Number(type) > 0 && Array.from({length: spellSlots[Number(type) - 1] }, (_,i) => (
                                <SpellSlotToggle key={i}/>
                            ))}
                        </Elements.Row>
                        { categories[type] }
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