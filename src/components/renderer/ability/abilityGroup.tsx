import { useEffect, useState } from 'react';
import CollapsibleGroup from 'components/common/collapsibleGroup';
import { AbilityToggleRenderer } from '.';
import { ActionType } from 'types/database/dnd';
import { IAbilityMetadata } from 'types/database/files/ability';
import ICreatureStats from 'types/database/files/iCreatureStats';

interface AbilityCategory { 
    header: string, 
    content: string[]
}

type AbilityGroupsProps = React.PropsWithRef<{
    abilities: Record<string, IAbilityMetadata>
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
        
        for (const key in abilities) {
            const ability = abilities[key]
            if (abilities[key] && key != null) {
                categories[ability.action ?? ActionType.Action].content.push(key)
            }
        }

        setCategories(categories)
    }, [abilities, stats?.multiAttack])

    const handleSetExpendedCharges = (value: number, key: string) => {
        setExpendedCharges({ ...expendedCharges, [key]: value })
    }
    
    return Object.keys(categories)
        .filter((type: ActionType) => categories[type].content.length > 0)
        .map((type: ActionType) => (
            <CollapsibleGroup key={type} header={categories[type].header}>
                { categories[type].content.map((key, index) => (
                    <AbilityToggleRenderer 
                        key={key} 
                        metadata={{ ...abilities[key], $values: values }} 
                        stats={stats}
                        expendedCharges={isNaN(expendedCharges[key]) ? 0 : expendedCharges[key]}
                        setExpendedCharges={(value) => handleSetExpendedCharges(value, key)}/>
                ))}
            </CollapsibleGroup>
        )
    )
}

export default AbilityGroups;