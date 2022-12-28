import React, { useEffect, useState } from 'react';
import Elements from 'elements';
import { useParser } from 'utils/parser';
import { getConditionModifier, getEffectModifier, getKeyName } from 'utils/calculations';
import { FileData, FileGetManyMetadataResult, FileMetadataQueryResult, FileType } from 'types/database/files';
import { CharacterStats } from 'types/database/files/character';
import { AbilityContent, AbilityMetadata } from 'types/database/files/ability';
import { AbilityType, ActionType, Attribute, DamageType, DiceType, EffectCondition } from 'types/database/dnd';
import { RendererObject } from 'types/database/editor';
import { RollMode } from 'types/elements';
import { DBResponse } from 'types/database';
import styles from 'styles/renderer.module.scss';
import { OptionTypes } from 'data/optionData';
import { toAbility } from 'importers/stringFormatAbilityImporter';

interface AbilityCategory {
    [key: string | ActionType]: { header: string, content: JSX.Element[] }
}

type AbilityGroupsProps = React.PropsWithRef<{
    abilityIds: string[]
    data?: CharacterStats
}>

type AbilityFileRendererProps = React.PropsWithRef<{
    file: FileData<AbilityContent,AbilityMetadata>
    stats?: CharacterStats
}>

type AbilityLinkRendererProps = React.PropsWithRef<{
    file: FileMetadataQueryResult<AbilityMetadata>
    stats?: CharacterStats
}>

type AbilityProps = React.PropsWithRef<{ 
    metadata: AbilityMetadata, 
    stats: CharacterStats
    open: boolean
}>

const getRange = (metadata: AbilityMetadata) => {
    switch (metadata.type)
    {
        case AbilityType.RangedAttack:
        case AbilityType.RangedWeapon:
            return { title: "Range ", text: `${metadata.range ?? 0} (${metadata.rangeLong ?? 0}) ft` }
        default:
        case AbilityType.Feature:
        case AbilityType.ThrownWeapon:
            return { title: "Reach ", text: `${metadata.range ?? 0} ft` }
    }
}

const Ability = ({ metadata, stats, open }: AbilityProps): JSX.Element => {
    let description = useParser(metadata.description, metadata)
    let conditionMod = getConditionModifier(metadata, stats);
    let effectMod = getEffectModifier(metadata, stats)
    let damageName = getKeyName(DamageType, metadata.damageType, DamageType.None)
    let range = getRange(metadata)
    switch(metadata.type) {
        case AbilityType.Feature:
        default:
            return <>
                <Elements.Header3>{ metadata.name }</Elements.Header3>
                { description }
            </>
        case AbilityType.RangedAttack:
        case AbilityType.RangedWeapon:
        case AbilityType.MeleeAttack:
        case AbilityType.MeleeWeapon:
        case AbilityType.ThrownWeapon:
            return <>
                <Elements.Align>
                    <div style={{ width: '50%'}}>
                        <Elements.Bold>{ metadata.name }</Elements.Bold><br/>
                        { OptionTypes["abilityType"].options[metadata.type] }
                    </div>
                    <Elements.Line/>
                    <div>
                        <div> 
                            <Elements.Bold>{range.title}</Elements.Bold> 
                            {range.text}
                        </div>
                        { metadata.type === AbilityType.ThrownWeapon &&
                            <div> 
                                <Elements.Bold>Range </Elements.Bold> 
                                {`${metadata.rangeThrown ?? 0} (${metadata.rangeLong ?? 0}) ft`}
                            </div>
                        }
                        { metadata.condition === EffectCondition.Hit &&
                            <div>
                                <Elements.Bold>HIT/DC </Elements.Bold>
                                <Elements.Roll 
                                    options={{ 
                                        mod: conditionMod as any, 
                                        desc: `${metadata.name} Attack` 
                                    }}
                                />
                            </div>
                        }{ metadata.condition === EffectCondition.Save &&
                            <div>
                                <Elements.Bold>HIT/DC </Elements.Bold>
                                <Elements.Save
                                    options={{
                                        attr: metadata.saveAttr ?? Attribute.STR,
                                        value: String(8 + conditionMod)
                                    }}
                                />
                            </div>
                        }{ metadata.damageType === DamageType.None ?
                            <div>
                                <Elements.Bold>Effect </Elements.Bold>
                                { metadata.effectText }
                            </div>
                            :
                            <>
                                <div>
                                    <Elements.Bold>Damage</Elements.Bold>
                                    { metadata.effectDice == DiceType.None ?
                                        <>
                                            {`${effectMod ?? 0} `}
                                            <Elements.Icon 
                                                options={{ 
                                                    icon: metadata.damageType,
                                                    tooltips: damageName 
                                                }}
                                            />
                                        </> 
                                        :
                                        <Elements.Roll 
                                            options={{ 
                                                dice: metadata.effectDice as any, 
                                                num: metadata.effectDiceNum ?? 1 as any, 
                                                mod: effectMod ?? 0 as any,
                                                mode: RollMode.DMG,
                                                desc: `${metadata.name} Damage`
                                            }}
                                        >
                                            <Elements.Icon 
                                                options={{ 
                                                    icon: metadata.damageType,
                                                    tooltips: damageName 
                                                }}
                                            />
                                        </Elements.Roll>
                                    }
                                </div>
                                { metadata.versatile && 
                                    <div>
                                        <Elements.Bold>2-Hand</Elements.Bold>
                                        { metadata.effectVersatileDice == DiceType.None ?
                                            <>
                                                {`${effectMod ?? 0} `}
                                                <Elements.Icon 
                                                    options={{ 
                                                        icon: metadata.damageType,
                                                        tooltips: damageName 
                                                    }}
                                                />
                                            </> 
                                            :
                                            <Elements.Roll 
                                                options={{ 
                                                    dice: metadata.effectVersatileDice as any, 
                                                    num: metadata.effectDiceNum ?? 1 as any, 
                                                    mod: effectMod ?? 0 as any,
                                                    mode: RollMode.DMG,
                                                    desc: `${metadata.name} 2-Hand Damage`
                                                }}
                                            >
                                                <Elements.Icon 
                                                    options={{ 
                                                        icon: metadata.damageType,
                                                        tooltips: damageName 
                                                    }}
                                                />
                                            </Elements.Roll>
                                        }
                                    </div>
                                }
                            </>
                        }{ metadata.notes && (metadata.notes.length > 0) && 
                            <div> 
                                <Elements.Bold>Notes </Elements.Bold> 
                                { metadata.notes } 
                            </div>
                        }
                    </div>
                </Elements.Align>
                { open && description && <>
                    <Elements.Line/>
                    { description }
                </>}
            </>
    }
}

const AbilityFileRenderer = ({ file, stats = {} }: AbilityFileRendererProps): JSX.Element => {
    const canClose = file.metadata.type !== AbilityType.Feature
    const [open, setOpen] = useState(!canClose);

    const handleClick = () => {
        setOpen(canClose && !open)
    }

    return (
        <div className={styles.ability} onClick={handleClick}>
            <Ability metadata={file.metadata} stats={stats} open={open}/>
        </div>
    )
}

const AbilityToggleRenderer = ({ file, stats = {} }: AbilityLinkRendererProps): JSX.Element => {
    const canClose = file.metadata.type !== AbilityType.Feature
    const [open, setOpen] = useState(!canClose);

    const handleClick = () => {
        setOpen(canClose && !open)
    }

    return (
        <div className={styles.ability} onClick={handleClick}>
            <Ability metadata={file.metadata} stats={stats} open={open}/>
        </div>
    )
}

const AbilityLinkRenderer = ({ file, stats = {} }: AbilityLinkRendererProps): JSX.Element => {
    return <Ability metadata={file.metadata} stats={stats} open={true}/>
}

const AbilityRenderer: RendererObject<AbilityContent,AbilityMetadata> = {
    fileRenderer: AbilityFileRenderer,
    linkRenderer: AbilityLinkRenderer
}

export const AbilityGroups = ({ abilityIds, data }: AbilityGroupsProps): JSX.Element => {
    const [abilities, setAbilities] = useState<FileGetManyMetadataResult>([])
    const [categories, setCategories] = useState<AbilityCategory>({})
    
    useEffect(() => {
        if (abilityIds && abilityIds.length > 0) {
            new Promise(async (resolve) => {
                var results = await Promise.all(abilityIds?.map((id) => toAbility(id)))
                var { resolved, ids } = results.reduce((prev, value, index) => (
                    value 
                    ? { resolved: [...prev.resolved, value], ids: prev.ids }
                    : { ids: [...prev.ids, abilityIds[index]], resolved: prev.resolved }
                ), { resolved: [], ids: [] } as { resolved: AbilityMetadata[], ids: string[] })

                var tempFiles = resolved.map((x) => (
                    { id: null, type: FileType.Ability, metadata: x }
                )) as FileGetManyMetadataResult

                if (ids?.length > 0) {
                    var response = await fetch(`/api/database/getManyMetadata?fileIds=${ids}`)
                    var res: DBResponse<FileGetManyMetadataResult> = await response.json()
                    if (res.success) {
                        
                        resolve([...tempFiles, ...res.result as FileGetManyMetadataResult])
                    } else {
                        console.warn(res.result);
                        resolve(tempFiles)
                    }
                }
                resolve(tempFiles)
            })
            .then((res: FileGetManyMetadataResult) => setAbilities(res))
            .catch(console.error)
        } else {
            setAbilities([])
        }
    }, [abilityIds])

    useEffect(() => {
        var categories = {
            [ActionType.None]: { header: null, content: [] },
            [ActionType.Action]: { header: "Actions", content: [] },
            [ActionType.BonusAction]: { header: "Bonus Actions", content: [] },
            [ActionType.Reaction]: { header: "Reactions", content: [] },
            [ActionType.Special]: { header: "Special", content: [] },
        } as AbilityCategory
        abilities.forEach((file, index) => {
            categories[file.metadata.action ?? ActionType.None].content.push(
                <AbilityToggleRenderer key={index} file={file} stats={data}/>
            )
        })
        setCategories(categories)
    }, [abilities])

    return (
        <>
            { Object.keys(categories)
                .filter((type) => categories[type].content.length > 0)
                .map((type) => (
                    <React.Fragment key={type}>
                        { categories[type].header && (
                            <Elements.Header2 options={{ underline: "true" }}>
                                {categories[type].header}
                            </Elements.Header2>
                        )}
                        { categories[type].content }
                    </React.Fragment>
            ))}
        </>
    )
}

export default AbilityRenderer;