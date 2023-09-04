import { useEffect, useState } from 'react';
import CollapsibleGroup from 'components/common/collapsibleGroup';
import { AbilityToggleRenderer } from '.';
import { ProcessFunction, useFiles } from 'utils/handlers/files';
import Logger from 'utils/logger';
import { toAbility } from 'utils/importers/stringFormatAbilityImporter';
import { ActionType } from 'types/database/dnd';
import { IAbilityMetadata } from 'types/database/files/ability';
import { ObjectIdText } from 'types/database';
import ICreatureStats from 'types/database/files/iCreatureStats';
import { FileGetManyMetadataResult, FileGetMetadataResult, FileMetadataQueryResult } from 'types/database/responses';
import { FileType } from 'types/database/files';

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

const AbilityGroups = ({ abilityIds, stats, values, expendedCharges, setExpendedCharges, onLoaded }: AbilityGroupsProps): React.ReactNode => {
    const [abilities, loading] = useFiles<IAbilityMetadata>(abilityIds, [FileType.Ability], processFunction)
    const [categories, setCategories] = useState<Partial<Record<ActionType, AbilityCategory>>>({})
    Logger.log("AbilityGroups", abilities, stats)

    useEffect(() => {
        const categories = {
            [ActionType.Action]: { header: `Actions (${(stats.multiAttack)} Attacks Per Action)`, content: [] },
            [ActionType.BonusAction]: { header: "Bonus Actions", content: [] },
            [ActionType.Reaction]: { header: "Reactions", content: [] },
            [ActionType.Special]: { header: "Special", content: [] },
            [ActionType.Legendary] : { header: "Legendary Actions", content: [] },
            [ActionType.None]: { header: "Other", content: [] },
        } satisfies Record<ActionType, AbilityCategory>
        abilities.forEach((file: FileMetadataQueryResult<IAbilityMetadata>, index) => {
            if (file) {
                categories[file.metadata?.action ?? ActionType.Action].content.push(
                    <AbilityToggleRenderer 
                        key={index} 
                        metadata={{ ...file.metadata, $values: values }} 
                        stats={stats}
                        expendedCharges={isNaN(expendedCharges[String(file.id)]) ? 0 : expendedCharges[String(file.id)]}
                        setExpendedCharges={(value) => setExpendedCharges({ ...expendedCharges, [String(file.id)]: value })}/>
                )
            }
        })
        setCategories(categories)
        if (!loading && onLoaded) {
            onLoaded(abilities)
        }
    }, [abilities, loading, stats, expendedCharges])
    
    return !loading && Object.keys(categories)
        .filter((type: ActionType) => categories[type].content.length > 0)
        .map((type: ActionType) => (
            <CollapsibleGroup key={type} header={categories[type].header}>
                { categories[type].content }
            </CollapsibleGroup>
        )
    )
}

export default AbilityGroups;