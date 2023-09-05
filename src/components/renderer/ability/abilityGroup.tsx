import { useEffect, useState } from 'react';
import CollapsibleGroup from 'components/common/collapsibleGroup';
import { AbilityToggleRenderer } from '.';
import Logger from 'utils/logger';
import { ActionType } from 'types/database/dnd';
import { IAbilityMetadata } from 'types/database/files/ability';
import ICreatureStats from 'types/database/files/iCreatureStats';
import { FileGetManyMetadataResult, FileMetadataQueryResult } from 'types/database/responses';

interface AbilityCategory { 
    header: string, 
    content: JSX.Element[] 
}

type AbilityGroupsProps = React.PropsWithRef<{
    abilities: FileGetManyMetadataResult<IAbilityMetadata>
    values?: Record<string, number>
    stats?: ICreatureStats
    expendedCharges: Record<string, number>
    setExpendedCharges: (value: Record<string, number>) => void
}>

const AbilityGroups = ({ abilities, stats, values, expendedCharges, setExpendedCharges }: AbilityGroupsProps): React.ReactNode => {
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
    }, [abilities, stats, expendedCharges])
    
    return Object.keys(categories)
        .filter((type: ActionType) => categories[type].content.length > 0)
        .map((type: ActionType) => (
            <CollapsibleGroup key={type} header={categories[type].header}>
                { categories[type].content }
            </CollapsibleGroup>
        )
    )
}

export default AbilityGroups;