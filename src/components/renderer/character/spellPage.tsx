import { useEffect, useState } from 'react';
import LinkInput from 'components/common/controls/linkInput';
import CollapsibleGroup from 'components/common/collapsibleGroup';
import SpellList from '../spell/spellList';
import Elements from 'data/elements';
import CharacterData from 'data/structures/character';
import { useFiles } from 'utils/handlers/files';
import { ICharacterStorage } from 'types/database/files/character';
import { FileContextDispatch } from 'types/context/fileContext';
import { ObjectId } from 'types/database';
import { FileType } from 'types/database/files';
import { ISpellMetadata } from 'types/database/files/spell';
import { FileGetMetadataResult } from 'types/database/responses';
import styles from 'styles/renderer.module.scss';


type CharacterSpellPageProps = React.PropsWithRef<{
    character: CharacterData 
    storage: ICharacterStorage
    setStorage: FileContextDispatch["setStorage"]
}>

const CharacterSpellPage = ({ character, storage, setStorage }: CharacterSpellPageProps): JSX.Element => {
    const [state, setState] = useState(null);
    const [cantrips] = useFiles<ISpellMetadata>(storage.cantrips, [FileType.Spell])
    const [spells] = useFiles<ISpellMetadata>(storage.learnedSpells, [FileType.Spell])
    const prepared = spells.filter(spell => storage.preparedSpells?.includes(spell.id) ?? false)
    const MaxLevel = character.maxSpellLevel

    const handleChange = (value: FileGetMetadataResult<ISpellMetadata>) => {
        if (value?.type === FileType.Spell 
         && spells.every(spell => spell.id !== value.id) 
         && cantrips.every(cantrip => cantrip.id !== value.id)) {
            if (value.metadata.level === 0) {
                setStorage("cantrips", [ ...storage.cantrips ?? [], value.id ])
            } else {
                setStorage("learnedSpells", [ ...storage.learnedSpells ?? [],value.id ])
            }
            setState(value.id)
        }
    }

    const handlePrepare = (id: ObjectId) => {
        let spells = storage.preparedSpells ?? []
        setStorage("preparedSpells", [...spells, id])
    }

    const handleRemoveSpell = (id: ObjectId) => {
        let spells = storage.learnedSpells ?? []
        let index = spells.findIndex(spellId => String(spellId) === String(id))
        if (index >= 0) {
            setStorage("learnedSpells", [ ...spells.slice(0, index), ...spells.slice(index + 1) ])
        }
    }

    const handleRemovePrepared = (id: ObjectId) => {
        let spells = storage.preparedSpells ?? []
        let index = spells.findIndex(spellId => String(spellId) === String(id))
        if (index >= 0) {
            setStorage("preparedSpells", [ ...spells.slice(0, index), ...spells.slice(index + 1) ])
        }
    }

    const handleRemoveCantrip = (id: ObjectId) => {
        let cantrips = storage.cantrips ?? []
        let index = cantrips.findIndex(spellId => String(spellId) === String(id))
        if (index >= 0) {
            setStorage("cantrips", [ ...cantrips.slice(0, index), ...cantrips.slice(index + 1) ])
        }
    }

    useEffect(() => {
        if (state) {
            setState(null)
        }
    }, [state])

    return (
        <>
            { !character.learnedAll &&
                <SpellList
                    header={`Known Spells (${spells.length}/${character.learnedSlots})`}
                    spells={spells}
                    maxLevel={MaxLevel}
                    validate={(prepared) => (prepared.metadata?.level ?? 1) <= MaxLevel}
                    removeIsDisabled={data => prepared.some(x => x.id === data.id)}
                    prepareIsDisabled={data => prepared.some(x => x.id === data.id) || prepared.length >= character.preparationSlots}
                    handleRemove={handleRemoveSpell}
                    handlePrepare={handlePrepare}/>
            }{ !character.learnedAll &&
                <SpellList
                    header={`Cantrips (${cantrips.length}/${character.cantripSlots})`}
                    spells={cantrips}
                    validate={(prepared) => prepared.metadata?.level === 0}
                    handleRemove={handleRemoveCantrip}/>
            }{ !character.preparationAll &&
                <SpellList
                    header={`Prepared Spells (${prepared.length ?? 0}/${character.preparationSlots})`}
                    spells={prepared}
                    maxLevel={MaxLevel}
                    validate={(prepared) => spells.some(spell => spell.id === prepared.id)}
                    handleRemove={handleRemovePrepared}/>
            }
            <CollapsibleGroup header="Add Spell">
                <div className={styles.modifierChoice}>
                    <Elements.Bold>Spell: </Elements.Bold>
                    <LinkInput
                        value={state}
                        placeholder="Spell ID..."
                        allowedTypes={[FileType.Spell]}
                        onChange={handleChange}/>
                </div>
            </CollapsibleGroup>
        </>
    )
}

export default CharacterSpellPage;