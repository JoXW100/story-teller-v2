import React, { useEffect, useMemo, useState } from 'react';
import { SpellToggleRenderer } from '.';
import Communication from 'utils/communication';
import Logger from 'utils/logger';
import { isObjectId } from 'utils/helpers';
import Elements from 'data/elements';
import ChargesRenderer from 'components/renderer/chargeToggle';
import { DBResponse, ObjectId, ObjectIdText } from 'types/database';
import ICreatureStats from 'types/database/files/iCreatureStats';
import { ISpellMetadata } from 'types/database/files/spell';
import { FileGetManyMetadataResult } from 'types/database/responses';
import { FileType } from 'types/database/files';

type SpellGroupsProps = React.PropsWithRef<{
    spellIds: ObjectIdText[]
    spellSlots: number[]
    expendedSlots: number[]
    stats?: ICreatureStats
    setExpendedSlots: (value: number[]) => void
}>

const SpellGroups = ({ spellIds, spellSlots, expendedSlots, stats, setExpendedSlots }: SpellGroupsProps): JSX.Element => {
    const [spells, setSpells] = useState<FileGetManyMetadataResult<ISpellMetadata>>([])
    const categories = useMemo(() => {
        let categories: Record<number, JSX.Element[]> = []
        spells.forEach((file, index) => {
            if (file.type === FileType.Spell) {
                let level = file.metadata?.level as number ?? 1
                categories[level] = [
                    ...categories[level] ?? [], 
                    <SpellToggleRenderer key={index} metadata={file.metadata} stats={stats}/>
                ]
            }
        })
        return categories
    }, [spells])
    
    useEffect(() => {
        if (spellIds && spellIds.length > 0) {
            let ids = spellIds.filter(spell => isObjectId(spell)) as ObjectId[]
            Communication.getManyMetadata(ids, [FileType.Spell])
            .then((res: DBResponse<FileGetManyMetadataResult<ISpellMetadata>>) => {
                if (res.success) {
                    setSpells(res.result)
                } else {
                    Logger.warn("SpellGroups.getManyMetadata", res.result);
                    setSpells([])
                }
            })
        } else {
            setSpells([])
        }
    }, [spellIds])

    const handleSetExpended = (value: number, level: number) => {
        let slots = Array.from({ length: spellSlots.length }, () => 0)
        for (let i = 0; i < expendedSlots.length && i < spellSlots.length; i++) {
            slots[i] = expendedSlots[i] ?? 0
        }
        slots[level - 1] = value
        setExpendedSlots(slots)
    }
    
    return (
        <>
            { Array.from({ length: spellSlots.length + 1}, (_, level) => (
                <React.Fragment key={level}>
                    <Elements.Row>
                        <Elements.Bold> 
                            {level === 0 ? 'Cantrips:' : `Level ${level}:`} 
                        </Elements.Bold>
                        { level > 0 &&
                            <ChargesRenderer 
                                charges={spellSlots[level - 1]}
                                expended={expendedSlots[level - 1]}
                                setExpended={(value) => handleSetExpended(value, level)}/>
                        }
                    </Elements.Row>
                    <Elements.Space/>
                    { categories[level] ?? <Elements.Space/> }
                    <Elements.Space/>
                </React.Fragment>
            ))}
        </>
    )
}

export default SpellGroups;