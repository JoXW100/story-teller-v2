import Elements from 'elements';
import React, { useEffect, useState } from 'react';
import SpellSlotToggle from 'components/common/spellSlotToggle';
import { useParser } from 'utils/parser';
import { getCastingTime, getConditionModifier, getDuration, getEffectModifier, getKeyName, getRange } from 'utils/calculations';
import { AreaType, Attribute, DamageType, EffectCondition, MagicSchool, TargetType } from 'types/database/dnd';
import { FileData, FileGetManyMetadataResult, FileMetadataQueryResult } from 'types/database/files';
import { SpellContent, SpellMetadata } from 'types/database/files/spell';
import { CharacterStats } from 'types/database/files/character';
import { RendererObject } from 'types/database/editor';
import { DBResponse } from 'types/database';
import { RollMode } from 'types/elements';
import styles from 'styles/renderer.module.scss';

interface SpellCategory {
    [type: number]: JSX.Element[]
}

type SpellGroupsProps = React.PropsWithRef<{
    spellIds: string[]
    spellSlots: number[]
    data?: CharacterStats
}>

type SpellProps = React.PropsWithRef<{
    metadata: SpellMetadata
    stats?: CharacterStats
    open: boolean
}>

type SpellFileRendererProps = React.PropsWithRef<{
    file: FileData<SpellContent,SpellMetadata>
    stats?: CharacterStats
}>

type SpellLinkRendererProps = React.PropsWithRef<{
    file: FileMetadataQueryResult<SpellMetadata>
    stats?: CharacterStats
}>

const Spell = ({ metadata, stats, open }: SpellProps) => {
    let description = useParser(metadata.description, metadata)
    let conditionMod = getConditionModifier(metadata, stats);
    let effectMod = getEffectModifier(metadata, stats)
    let school = getKeyName(MagicSchool, metadata.school, MagicSchool.Evocation)
    let castingTime = getCastingTime(metadata);
    let duration = getDuration(metadata);
    let range = getRange(metadata)
    let area = getKeyName(AreaType, metadata.area, AreaType.None)

    return (
        <>
            <Elements.Align>
                <Elements.Align options={{ direction: "v", weight: "1.5" }}>
                    <Elements.Bold> {metadata.name} </Elements.Bold>
                    {`Level ${metadata.level}, ${school}`}
                </Elements.Align>
                <Elements.Align options={{ direction: "v" }}>
                    <Elements.Bold> Casting Time </Elements.Bold>
                    {castingTime}
                </Elements.Align>
                <Elements.Align options={{ direction: "v" }}>
                    <Elements.Bold> Duration </Elements.Bold>
                    { metadata.concentration ? `${duration} (C)` : duration }
                </Elements.Align>
                { metadata.target !== TargetType.None &&
                    <Elements.Align options={{ direction: "v" }}>
                        <div className={styles.spellAreaRow}>
                            <Elements.Bold> Range/Area </Elements.Bold>
                            <Elements.Icon options={{ 
                                icon: metadata.area, tooltips: area 
                            }}/>
                        </div>
                        {range}
                    </Elements.Align>
                }
                { metadata.condition === EffectCondition.Hit &&
                    <Elements.Align options={{ direction: "v", weight: "0.85"  }}>
                        <Elements.Bold>HIT/DC </Elements.Bold>
                        <Elements.Roll 
                            options={{ 
                                mod: conditionMod as any, 
                                desc: `${metadata.name} Attack` 
                            }}
                        />
                    </Elements.Align>
                }
                { metadata.condition === EffectCondition.Save &&
                    <Elements.Align options={{ direction: "v", weight: "0.85"  }}>
                        <Elements.Bold>HIT/DC </Elements.Bold>
                        <Elements.Save
                            options={{
                                attr: metadata.saveAttr ?? Attribute.STR,
                                value: String(8 + conditionMod)
                            }}
                        />
                    </Elements.Align>
                }
                { metadata.damageType === DamageType.None && (
                    <Elements.Align options={{ direction: "v", weight: "0.7"  }}>
                        <Elements.Bold>Effect </Elements.Bold>
                        { metadata.effectText }
                    </Elements.Align>
                )}
                { metadata.damageType !== DamageType.None && (
                    <Elements.Align options={{ direction: "v", weight: "0.7" }}>
                        <Elements.Bold>Damage </Elements.Bold>
                        <Elements.Roll 
                            options={{ 
                                dice: metadata.effectDice as any, 
                                num: metadata.effectDiceNum as any, 
                                mod: effectMod as any, 
                                mode: RollMode.DMG,
                                desc: `${metadata.name} Damage`
                            }}
                        >
                            <Elements.Icon 
                                options={{ 
                                    icon: metadata.damageType,
                                    tooltips: Object.keys(DamageType).find((key) => DamageType[key] === metadata.damageType) 
                                }}
                            />
                        </Elements.Roll>
                    </Elements.Align >
                )}
            </Elements.Align>
            { open && description && <>
                <Elements.Line/>
                { description }
            </>}
        </>
    )
}

const SpellFileRenderer = ({ file, stats = {} }: SpellFileRendererProps): JSX.Element => {
    const [open, setOpen] = useState(false);

    const handleClick = () => {
        setOpen(!open);
    }

    return (
        <div className={styles.spell} onClick={handleClick}>
            <Spell metadata={file.metadata} stats={stats} open={open}/>
        </div>
    )
}

const AbilityToggleRenderer = ({ file, stats }: SpellLinkRendererProps): JSX.Element => {
    const [open, setOpen] = useState(false);

    const handleClick = () => {
        setOpen(!open);
    }

    return (
        <div className={styles.spell} onClick={handleClick}>
            <Spell metadata={file.metadata} stats={stats} open={open}/>
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
        var categories: { [type: number]: JSX.Element[] } = []
        spells.forEach((file, index) => {
            if (file.type === 'spe') {
                var level = file.metadata.level as number ?? 1
                categories[level] = [
                    ...categories[level] ?? [], 
                    <AbilityToggleRenderer key={index} file={file} stats={data}/>
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