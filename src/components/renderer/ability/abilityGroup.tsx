import { useEffect, useState } from 'react';
import CollapsibleGroup from 'components/common/collapsibleGroup';
import { AbilityToggleRenderer } from '.';
import Logger from 'utils/logger';
import { ActionType } from 'types/database/dnd';
import { IAbilityMetadata } from 'types/database/files/ability';
import { FileGetManyMetadataResult, FileMetadataQueryResult } from 'types/database/responses';
import { IParserMetadata } from 'types/elements';
import { ObjectId } from 'types/database';
import ICreatureStats from 'types/database/files/iCreatureStats';

interface AbilityCategory { 
    header: string, 
    content: FileMetadataQueryResult<IAbilityMetadata & IParserMetadata>[]
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

    useEffect(() => {
        const categories: Record<ActionType, AbilityCategory> = {
            [ActionType.Action]: { header: `Actions${stats.multiAttack > 1 ? ` (${stats.multiAttack} Attacks Per Action)` : ''}`, content: [] },
            [ActionType.BonusAction]: { header: "Bonus Actions", content: [] },
            [ActionType.Reaction]: { header: "Reactions", content: [] },
            [ActionType.Special]: { header: "Special", content: [] },
            [ActionType.Legendary] : { header: "Legendary Actions", content: [] },
            [ActionType.None]: { header: "Other", content: [] },
        }
        abilities.forEach((file) => {
            if (file) {
                categories[file.metadata?.action ?? ActionType.Action].content.push({ ...file, metadata: { ...file?.metadata, $values: values } })
            }
        })
        setCategories(categories)
    }, [abilities, stats?.multiAttack])

    const handleSetExpendedCharges = (value: number, id: ObjectId) => {
        setExpendedCharges({ ...expendedCharges, [String(id)]: value })
    }
    
    return Object.keys(categories)
        .filter((type: ActionType) => categories[type].content.length > 0)
        .map((type: ActionType) => (
            <CollapsibleGroup key={type} header={categories[type].header}>
                { categories[type].content.map((file, index) => file && (
                    <AbilityToggleRenderer 
                        key={String(file.id ?? index)} 
                        metadata={file.metadata} 
                        stats={stats}
                        expendedCharges={isNaN(expendedCharges[String(file.id)]) ? 0 : expendedCharges[String(file.id)]}
                        setExpendedCharges={(value) => handleSetExpendedCharges(value, file.id)}/>
                ))}
            </CollapsibleGroup>
        )
    )
}

export default AbilityGroups;