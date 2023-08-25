import LinkInput from 'components/common/controls/linkInput';
import CollapsibleGroup from 'components/common/collapsibleGroup';
import SpellList from '../spell/spellList';
import Elements from 'data/elements';
import CharacterData from 'data/structures/character';
import { useFiles } from 'utils/handlers/files';
import Communication from 'utils/communication';
import { ICharacterStorage } from 'types/database/files/character';
import { FileContextDispatch } from 'types/context/fileContext';
import { ObjectId } from 'types/database';
import { FileType } from 'types/database/files';
import { ISpellMetadata } from 'types/database/files/spell';
import styles from 'styles/renderer.module.scss';

type CharacterSpellPageProps = React.PropsWithRef<{
    character: CharacterData 
    storage: ICharacterStorage
    setStorage: FileContextDispatch["setStorage"]
}>

const CharacterSpellPage = ({ character, storage, setStorage }: CharacterSpellPageProps): JSX.Element => {
    const [cantrips] = useFiles<ISpellMetadata>(storage.cantrips)
    const [spells] = useFiles<ISpellMetadata>(storage.learnedSpells)
    const prepared = spells.filter(spell => storage.preparedSpells?.includes(spell.id) ?? false)
    const MaxLevel = character.maxSpellLevel

    const handleChange = (value: ObjectId) => {
        if (!spells.some(spell => spell.id === value) && !cantrips.some(cantrip => cantrip.id === value)) {
            Communication.getMetadata(value)
            .then((res) => {
                if (res.success && res.result.type === FileType.Spell) {
                    let spell: ISpellMetadata = res.result.metadata
                    if (spell.level === 0) {
                        setStorage("cantrips", [ ...(storage.cantrips ?? []), value ])
                    } else {
                        setStorage("learnedSpells", [ ...(storage.learnedSpells ?? []), value ])
                    }
                }
            })
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
                        value={null}
                        fileTypes={[FileType.Spell]}
                        placeholder="Spell ID..."
                        allowRemove={false}
                        onChange={handleChange}/>
                </div>
            </CollapsibleGroup>
        </>
    )
}

export default CharacterSpellPage;