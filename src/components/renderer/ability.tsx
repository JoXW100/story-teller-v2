import React, { useEffect, useMemo, useState } from 'react';
import Elements from 'data/elements';
import AbilityData from 'data/structures/ability';
import EffectRenderer from './effect';
import ChargesRenderer from './chargeToggle';
import { toAbility } from 'utils/importers/stringFormatAbilityImporter';
import { useParser } from 'utils/parser';
import { ProcessFunction, useFiles } from 'utils/handlers/files';
import Localization from 'utils/localization';
import Logger from 'utils/logger';
import AbilityFile, { IAbilityMetadata } from 'types/database/files/ability';
import ICreatureStats from 'types/database/files/iCreatureStats';
import { RendererObject } from 'types/database/editor';
import { IParserMetadata, RollMode } from 'types/elements';
import { FileType } from 'types/database/files';
import { ObjectIdText } from 'types/database';
import { FileGetManyMetadataResult, FileGetMetadataResult, FileMetadataQueryResult } from 'types/database/responses';
import { AbilityType, ActionType, Attribute, EffectCondition } from 'types/database/dnd';
import styles from 'styles/renderer.module.scss';

interface AbilityCategory { 
    header: string, 
    content: JSX.Element[] 
}

type AbilityGroupsProps = React.PropsWithRef<{
    abilityIds: ObjectIdText[]
    values?: Record<string, number>
    stats?: ICreatureStats
    expendedCharges: Record<string, number>
    setExpendedCharges: (value: Record<string, number>) => void
    onLoaded?: (abilities: FileGetManyMetadataResult<IAbilityMetadata>) => void 
}>

type AbilityGroupProps = React.PropsWithChildren<{
    header: string
}>

type AbilityFileRendererProps = React.PropsWithRef<{
    file: AbilityFile
    stats?: ICreatureStats
}>

type AbilityLinkRendererProps = React.PropsWithRef<{
    file: FileMetadataQueryResult<IAbilityMetadata>
    stats?: ICreatureStats
}>

type AbilityToggleRendererProps = React.PropsWithRef<{
    metadata: IAbilityMetadata & IParserMetadata
    stats: ICreatureStats
    expendedCharges: number
    setExpendedCharges: (value: number) => void
    open?: boolean
}>


type AbilityProps = React.PropsWithRef<{ 
    metadata: IAbilityMetadata, 
    stats: ICreatureStats
    expendedCharges: number
    setExpendedCharges: (value: number) => void
    open: boolean
    variablesKey: string
}>

const Ability = ({ metadata, stats, open, variablesKey, expendedCharges, setExpendedCharges }: AbilityProps): JSX.Element => {
    const ability = useMemo(() => new AbilityData(metadata, stats), [metadata, stats])
    const description = useParser(ability.description, ability, variablesKey)
    Logger.log("Ability", "Ability")

    switch(ability.type) {
        case AbilityType.Feature:
        default:
            return <>
                <Elements.Align options={{ direction: "hc" }}>
                    <Elements.Header3>{ ability.name }</Elements.Header3>
                    <Elements.Fill/>
                    <ChargesRenderer 
                        charges={ability.charges}
                        expended={expendedCharges} 
                        setExpended={setExpendedCharges}/>
                </Elements.Align>
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
                        <Elements.Bold>{ability.name}</Elements.Bold><br/>
                        {ability.typeName}<br/>
                        <Elements.Align>
                            <ChargesRenderer 
                                charges={ability.charges} 
                                expended={expendedCharges} 
                                setExpended={setExpendedCharges}/>
                        </Elements.Align>
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
                                        mode: RollMode.Attack,
                                        mod: String(ability.conditionModifierValue), 
                                        desc: `${ability.name} Attack`,
                                        critRange: String(ability.stats.critRange),
                                    }}
                                />
                            </div>
                        }{ ability.condition == EffectCondition.Save &&
                            <div>
                                <Elements.Bold>HIT/DC </Elements.Bold>
                                <Elements.Save
                                    options={{
                                        attr: ability.saveAttr ?? Attribute.STR,
                                        value: String(ability.conditionSaveValue)
                                    }}
                                />
                            </div>
                        }{ ability.effects.map((effect) => (
                            <EffectRenderer key={effect.id} data={effect} stats={stats} id={variablesKey} />
                        ))}{ ability.notes.length > 0 && 
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

const AbilityFileRenderer = ({ file, stats = {} }: AbilityFileRendererProps): JSX.Element => {
    const [expended, setExpended] = useState<number>(0)
    return (
        <AbilityToggleRenderer 
            metadata={file.metadata} 
            stats={stats} 
            expendedCharges={expended}
            setExpendedCharges={setExpended}
            open={true}/>
    )
}

const AbilityToggleRenderer = ({ metadata, stats = {}, expendedCharges, setExpendedCharges, open = false }: AbilityToggleRendererProps): JSX.Element => {
    const [isOpen, setOpen] = useState(open);
    const canClose =  metadata?.type && metadata?.type !== AbilityType.Feature
    const data = canClose && metadata?.description?.length > 0
        ? isOpen ? "open" : "closed"
        : "none"

    const handleClick = () => {
        if (canClose) {
            setOpen(!isOpen)
        }
    }

    return (
        <div 
            className={styles.ability} 
            data={data} 
            onClick={handleClick}>
            <Ability 
                metadata={metadata} 
                stats={stats} 
                open={isOpen} 
                variablesKey='description'
                expendedCharges={expendedCharges}
                setExpendedCharges={setExpendedCharges}/>
        </div>
    )
}

const AbilityLinkRenderer = ({ file, stats = {} }: AbilityLinkRendererProps): JSX.Element => {
    const [expended, setExpended] = useState<number>(0)
    return (
        <Ability 
            metadata={file.metadata} 
            stats={stats} 
            open={true} 
            variablesKey={`$${file.id}.description`}
            expendedCharges={expended}
            setExpendedCharges={setExpended}/>
    )
}

const parseText = async (value: string): Promise<FileGetMetadataResult> => {
    let res = await toAbility(value)
    if (res) {
        return {
            id: null,
            type: FileType.Ability,
            metadata: res
        } satisfies FileGetMetadataResult
    }
    return null
}

const processFunction: ProcessFunction<IAbilityMetadata> = async (ids) => {
    return (await Promise.all(ids.map((id) => parseText(String(id)))))
    .reduce((prev, ability, index) => (
        ability ? { ...prev, results: [...prev.results, ability] }
                : { ...prev, rest: [...prev.rest, ids[index] ] }
    ), { results: [], rest: [] })
} 

export const AbilityGroups = ({ abilityIds, stats, values, expendedCharges, setExpendedCharges, onLoaded }: AbilityGroupsProps): React.ReactNode => {
    const [abilities, loading] = useFiles<IAbilityMetadata>(abilityIds, processFunction)
    const [categories, setCategories] = useState<Partial<Record<ActionType, AbilityCategory>>>({})
    Logger.log("Ability", "AbilityGroups")

    useEffect(() => {
        const categories = {
            [ActionType.None]: { header: null, content: [] },
            [ActionType.Action]: { header: "Actions", content: [] },
            [ActionType.BonusAction]: { header: "Bonus Actions", content: [] },
            [ActionType.Reaction]: { header: "Reactions", content: [] },
            [ActionType.Special]: { header: "Special", content: [] },
            [ActionType.Legendary] : { header: "Legendary Actions", content: [] },
        } satisfies Record<ActionType, AbilityCategory>
        abilities.forEach((file: FileMetadataQueryResult<IAbilityMetadata>, index) => {
            categories[file.metadata?.action ?? ActionType.Action].content.push(
                <AbilityToggleRenderer 
                    key={index} 
                    metadata={{ ...file.metadata, $values: values }} 
                    stats={stats}
                    expendedCharges={expendedCharges[String(file.id)]}
                    setExpendedCharges={(value) => setExpendedCharges({ ...expendedCharges, [String(file.id)]: value })}/>
            )
        })
        setCategories(categories)
        if (!loading && onLoaded) {
            onLoaded(abilities)
        }
    }, [abilities, loading, stats])
    
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

const AbilityRenderer: RendererObject<AbilityFile> = {
    fileRenderer: AbilityFileRenderer,
    linkRenderer: AbilityLinkRenderer
}

export default AbilityRenderer;