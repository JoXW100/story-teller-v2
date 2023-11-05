import { useState } from 'react';
import RemoveIcon from '@mui/icons-material/Remove';
import PrepareIcon from '@mui/icons-material/ImportContactsSharp';
import CollapsibleGroup from 'components/common/collapsibleGroup';
import SpellData from 'data/structures/spell';
import { ObjectId } from 'types/database';
import { ISpellMetadata } from 'types/database/files/spell';
import { FileGetMetadataResult } from 'types/database/responses';
import styles from 'styles/renderer.module.scss';
import { asNumber } from 'utils/helpers';

type SpellListProps = React.PropsWithRef<{
    header: string
    spells: FileGetMetadataResult<ISpellMetadata>[]
    maxLevel?: number
    removeIsDisabled?: (data: FileGetMetadataResult<ISpellMetadata>) => boolean
    prepareIsDisabled?: (data: FileGetMetadataResult<ISpellMetadata>) => boolean
    validate: (data: FileGetMetadataResult<ISpellMetadata>) => boolean
    handleRemove: (id: ObjectId) => void
    handlePrepare?: (id: ObjectId) => void
}>

type SpellListItemProps = React.PropsWithRef<{
    data: FileGetMetadataResult<ISpellMetadata>
    removeIsDisabled: boolean
    prepareIsDisabled: boolean
    handleRemove: (id: ObjectId) => void
    handlePrepare: (id: ObjectId) => void
    validate: (data: FileGetMetadataResult<ISpellMetadata>) => boolean
}>

const SpellList = ({ header, spells, maxLevel = 0, removeIsDisabled, prepareIsDisabled, validate, handleRemove, handlePrepare = null }: SpellListProps) => {
    const [filter, setFilter] = useState<boolean[]>([])

    const handleFilterCLick = (index: number) => {
        let newFilter = [...filter]
        newFilter[index] = !(newFilter[index] ?? true)
        setFilter(newFilter)
    }

    const spellSort = (a: FileGetMetadataResult<ISpellMetadata>, b: FileGetMetadataResult<ISpellMetadata>) => {
        let levelDiff = asNumber(a.metadata?.level, 1) - asNumber(b.metadata?.level, 1)
        if (levelDiff !== 0) return levelDiff
        return (a.metadata?.name ?? "").localeCompare(b.metadata?.name ?? "")
    }

    return (
        <CollapsibleGroup header={header}>
            { maxLevel > 0 &&
                <div className={styles.spellFilterMenu}>
                    <b>Filter: </b>
                    { Array.from({ length: maxLevel }).map((_, index) => (
                        <button 
                            key={index}
                            className={styles.spellFilterMenuItem}
                            tooltips={`Toggle`}
                            data={String(filter[index] ?? true)}
                            onClick={() => handleFilterCLick(index)}>
                            {index + 1}
                        </button>
                    ))}
                </div>
            }
            { spells
                .filter((spell => filter[(spell.metadata?.level ?? 1) - 1] ?? true))
                .sort(spellSort)
                .map((data) => 
                <SpellListItem 
                    key={String(data.id)} 
                    data={data}
                    removeIsDisabled={removeIsDisabled && removeIsDisabled(data)}
                    prepareIsDisabled={prepareIsDisabled && prepareIsDisabled(data)}
                    validate={validate}
                    handleRemove={handleRemove}
                    handlePrepare={handlePrepare}/>
            )}
        </CollapsibleGroup>
    )
}

const SpellListItem = ({ data, removeIsDisabled, prepareIsDisabled, handleRemove, handlePrepare, validate }: SpellListItemProps) => {
    let spell = new SpellData(data.metadata)
    return (
        <div className={styles.spellItem} error={String(!validate(data))}>
            <b>{spell.name}: </b>
            <span>{spell.levelText}</span>
            <span>{spell.schoolName}</span>
            { handlePrepare &&
                <button 
                    tooltips="Prepare"
                    disabled={prepareIsDisabled}
                    onClick={() => handlePrepare(data.id)}>
                    <PrepareIcon/>
                </button>
            }
            <button 
                tooltips="Remove" 
                disabled={removeIsDisabled}
                onClick={() => handleRemove(data.id)}>
                <RemoveIcon/>
            </button>
        </div>
    )
}

export default SpellList;