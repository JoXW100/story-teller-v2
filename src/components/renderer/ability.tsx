import React, { useEffect, useState } from 'react';
import Elements from 'data/elements';
import AbilityData from 'data/structures/ability';
import { toAbility } from 'utils/importers/stringFormatAbilityImporter';
import { useParser } from 'utils/parser';
import { ProcessFunction, useFiles } from 'utils/handlers/files';
import Localization from 'utils/localization';
import { FileData, FileGetManyMetadataResult, FileGetMetadataResult, IFileMetadataQueryResult, FileType } from 'types/database/files';
import { AbilityContent, AbilityMetadata } from 'types/database/files/ability';
import { AbilityType, ActionType, Attribute, DamageType, DiceType, EffectCondition } from 'types/database/dnd';
import { RendererObject } from 'types/database/editor';
import { RollMode } from 'types/elements';
import ICreatureStats from 'types/database/files/iCreatureStats';
import { ObjectId } from 'types/database';
import styles from 'styles/renderer.module.scss';

interface AbilityCategory { 
    header: string, 
    content: JSX.Element[] 
}

type AbilityGroupsProps = React.PropsWithRef<{
    abilityIds: ObjectId[]
    stats?: ICreatureStats
    onLoaded?: (abilities: FileGetManyMetadataResult<AbilityMetadata>) => void 
}>

type AbilityGroupProps = React.PropsWithChildren<{
    header: string
}>

type AbilityFileRendererProps = React.PropsWithRef<{
    file: FileData<AbilityContent,AbilityMetadata,undefined>
    stats?: ICreatureStats
}>

type AbilityLinkRendererProps = React.PropsWithRef<{
    file: IFileMetadataQueryResult<AbilityMetadata>
    stats?: ICreatureStats
}>

type AbilityToggleRendererProps = React.PropsWithRef<{
    metadata: AbilityMetadata
    stats: ICreatureStats
    isOpen?: boolean
}>


type AbilityProps = React.PropsWithRef<{ 
    metadata: AbilityMetadata, 
    stats: ICreatureStats
    open: boolean
    variablesKey: string
}>

const Ability = ({ metadata, stats, open }: AbilityProps, variablesKey): JSX.Element => {
    let ability = new AbilityData(metadata, stats)
    let description = useParser(ability.description, metadata, variablesKey)

    switch(ability.type) {
        case AbilityType.Feature:
        default:
            return <>
                <Elements.Header3>{ ability.name }</Elements.Header3>
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
                        <Elements.Bold>{ ability.name }</Elements.Bold><br/>
                        {ability.typeName}
                    </div>
                    <Elements.Line/>
                    <div>
                        { ability.type == AbilityType.RangedAttack 
                          || ability.type == AbilityType.RangedWeapon ?
                            <div> 
                                <Elements.Bold>Range </Elements.Bold> 
                                {`${ability.range} (${ability.rangeLong}) ft`}
                            </div>
                            :
                            <div> 
                                <Elements.Bold>Reach </Elements.Bold> 
                                {`${ability.range} ft`}
                            </div>
                        }{ ability.type == AbilityType.ThrownWeapon &&
                            <div className={styles.iconRow}> 
                                <Elements.Bold>Range </Elements.Bold> 
                                {`${ability.rangeThrown} (${ability.rangeLong}) ft`}
                            </div>
                        }{ ability.condition == EffectCondition.Hit &&
                            <div>
                                <Elements.Bold>HIT/DC </Elements.Bold>
                                <Elements.Roll 
                                    options={{ 
                                        mod: ability.conditionModifierValue as any, 
                                        desc: `${ability.name} Attack` 
                                    }}
                                />
                            </div>
                        }{ ability.condition == EffectCondition.Save &&
                            <div>
                                <Elements.Bold>HIT/DC </Elements.Bold>
                                <Elements.Save
                                    options={{
                                        attr: ability.saveAttr ?? Attribute.STR,
                                        value: ability.conditionSaveValue as any
                                    }}
                                />
                            </div>
                        }{ ability.damageType == DamageType.None ?
                            <div>
                                <Elements.Bold>Effect </Elements.Bold>
                                {ability.effectText}
                            </div>
                            :
                            <>
                                <div className={styles.iconRow}>
                                    <Elements.Bold>Damage</Elements.Bold>
                                    <Elements.Roll 
                                        options={{ 
                                            dice: ability.effectDice as any, 
                                            num: ability.effectDiceNum as any, 
                                            mod: ability.effectModifierValue as any,
                                            mode: ability.effectDice == DiceType.None 
                                                ? RollMode.Mod 
                                                : RollMode.DMG,
                                            desc: `${ability.name} Damage`
                                        }}
                                    >
                                        <Elements.Icon 
                                            options={{ 
                                                icon: ability.damageType,
                                                tooltips: ability.damageTypeName
                                            }}
                                        />
                                    </Elements.Roll>
                                </div>
                                { ability.versatile && 
                                    <div className={styles.iconRow}>
                                        <Elements.Bold>2-Hand </Elements.Bold>
                                        <Elements.Roll 
                                            options={{ 
                                                dice: ability.effectVersatileDice as any, 
                                                num: ability.effectDiceNum as any, 
                                                mod: ability.effectModifierValue as any,
                                                mode: ability.effectVersatileDice == DiceType.None 
                                                    ? RollMode.Mod 
                                                    : RollMode.DMG,
                                                desc: `${ability.name} 2H Damage`
                                            }}
                                        >
                                            <Elements.Icon 
                                                options={{ 
                                                    icon: ability.metadata.damageType,
                                                    tooltips: ability.damageTypeName 
                                                }}
                                            />
                                        </Elements.Roll>
                                    </div>
                                }
                            </>
                        }{ ability.notes.length > 0 && 
                            <div> 
                                <Elements.Bold>Notes </Elements.Bold> 
                                {ability.notes} 
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

const AbilityFileRenderer = ({ file, stats = {} }: AbilityFileRendererProps): JSX.Element => (
    <AbilityToggleRenderer metadata={file.metadata} stats={stats} isOpen={true}/>
)

const AbilityToggleRenderer = ({ metadata = {}, stats = {}, isOpen = false }: AbilityToggleRendererProps): JSX.Element => {
    const canClose = metadata?.type !== AbilityType.Feature
    const [open, setOpen] = useState(isOpen);
    const data = canClose && metadata.description
        ? open ? "open" : "closed"
        : "none"
    const handleClick = () => {
        setOpen(!open)
    }

    return (
        <div className={styles.ability} data={data} onClick={canClose ? handleClick : undefined}>
            <Ability metadata={metadata} stats={stats} open={open} variablesKey='description'/>
        </div>
    )
}

const AbilityLinkRenderer = ({ file, stats = {} }: AbilityLinkRendererProps): JSX.Element => {
    return <Ability metadata={file.metadata} stats={stats} open={true} variablesKey={`$${file.id}.description`}/>
}

const AbilityRenderer: RendererObject<AbilityContent,AbilityMetadata> = {
    fileRenderer: AbilityFileRenderer,
    linkRenderer: AbilityLinkRenderer
}

const parseText = async (value: string): Promise<FileGetMetadataResult> => {
    let res = await toAbility(value)
    if (res) {
        return {
            id: null,
            type: FileType.Ability,
            metadata: res
        }
    }
    return null
}

const processFunction: ProcessFunction<AbilityMetadata> = async (ids) => {
    return (await Promise.all(ids.map((id) => parseText(String(id)))))
    .reduce((prev, ability, index) => (
        ability ? { ...prev, results: [...prev.results, ability] }
                : { ...prev, rest: [...prev.rest, ids[index] ] }
    ), { results: [], rest: [] })
} 

export const AbilityGroups = ({ abilityIds, stats, onLoaded }: AbilityGroupsProps): React.ReactNode => {
    const [abilities, loading] = useFiles<AbilityMetadata>(abilityIds, processFunction)
    const [categories, setCategories] = useState<Partial<Record<ActionType, AbilityCategory>>>({})

    useEffect(() => {
        const categories = {
            [ActionType.None]: { header: null, content: [] },
            [ActionType.Action]: { header: "Actions", content: [] },
            [ActionType.BonusAction]: { header: "Bonus Actions", content: [] },
            [ActionType.Reaction]: { header: "Reactions", content: [] },
            [ActionType.Special]: { header: "Special", content: [] },
            [ActionType.Legendary] : { header: "Legendary Actions", content: [] },
        } satisfies Record<ActionType, AbilityCategory>
        abilities.forEach((file: IFileMetadataQueryResult<AbilityMetadata>, index) => {
            categories[file.metadata?.action ?? ActionType.None].content.push(
                <AbilityToggleRenderer key={index} metadata={file.metadata} stats={stats}/>
            )
        })
        setCategories(categories)
        if (!loading && onLoaded) {
            onLoaded(abilities)
        }
    }, [abilities, loading])
    
    return !loading && Object.keys(categories)
        .filter((type: ActionType) => categories[type].content.length > 0)
        .map((type: ActionType) => (
            <AbilityGroup key={type} header={categories[type].header}>
                { categories[type].content }
            </AbilityGroup>
        )
    )
}

const AbilityGroup = ({ header, children }: AbilityGroupProps): JSX.Element => {
    const [open, setOpen] = useState(true)
    const tooltips = open 
        ? Localization.toText('common-collapse')
        : Localization.toText('common-expand')
    return <>
        { header && (
            <div className={styles.abilityGroupHeader} data={open ? "open" : "closed"}>
                <button 
                    onClick={() => setOpen(!open)}
                    tooltips={tooltips}>
                    <Elements.Header2>
                        {header}
                    </Elements.Header2>
                </button>
            </div>
        )}
        { open && children }
    </>
}

export default AbilityRenderer;