import CollapsibleGroup from 'components/common/collapsibleGroup';
import LinkInput from 'components/common/controls/linkInput';
import RemoveIcon from '@mui/icons-material/Remove';
import EquipIcon from '@mui/icons-material/AddModeratorSharp';
import { useFiles } from 'utils/handlers/files';
import Elements from 'data/elements';
import CharacterData from 'data/structures/character';
import ItemData from 'data/structures/item';
import { FileContextDispatch } from 'types/context/fileContext';
import { ICharacterStorage } from 'types/database/files/character';
import { IItemMetadata } from 'types/database/files/item';
import { FileType } from 'types/database/files';
import { ObjectId } from 'types/database';
import styles from 'styles/renderer.module.scss';
import { ItemType } from 'types/database/dnd';

type ItemsPageProps = React.PropsWithRef<{
    character: CharacterData
    storage: ICharacterStorage
    setStorage: FileContextDispatch["setStorage"]
}>

const ItemsPage = ({ character, storage, setStorage }: ItemsPageProps): JSX.Element => {
    const [items] = useFiles<IItemMetadata>(storage.inventory)
    const equipped = items.filter(item => (storage.equipped ?? []).includes(item.id))

    const handleChange = (value: ObjectId) => {
        if (items.every(item => item.id !== value)) {
            setStorage("inventory", [...(storage.inventory ?? []), value])
        }
    }

    const handleRemove = (id: ObjectId) => {
        let items = storage.inventory ?? []
        let index = items.findIndex(itemId => String(itemId) === String(id))
        if (index >= 0) {
            setStorage("inventory", [ ...items.slice(0, index), ...items.slice(index + 1) ])
        }
    }

    const handleRemoveEquipped = (id: ObjectId) => {
        let items = storage.equipped ?? []
        let index = items.findIndex(itemId => String(itemId) === String(id))
        if (index >= 0) {
            setStorage("equipped", [ ...items.slice(0, index), ...items.slice(index + 1) ])
        }
    }

    const handleEquip = (id: ObjectId) => {
        setStorage("equipped", [...(storage.equipped ?? []), id])
    }
    
    return (
        <>
            <CollapsibleGroup header={"Inventory"}>
                { items.map((data) => {
                    const item = new ItemData(data.metadata)
                    const isEquipped = equipped.some(x => x.id === data.id)
                    return (
                        <div key={String(data.id)} className={styles.spellItem}>
                            <b>{item.name}</b>
                            {item.typeName}
                            {[ItemType.Armor, ItemType.MeleeWeapon, ItemType.RangedWeapon, ItemType.ThrownWeapon, ItemType.Trinket].includes(item.type) &&
                                <button 
                                    tooltips="Equip"
                                    disabled={isEquipped}
                                    onClick={() => handleEquip(data.id)}>
                                    <EquipIcon/>
                                </button>
                            }
                            <button 
                                tooltips="Remove"
                                disabled={isEquipped}
                                onClick={() => handleRemove(data.id)}>
                                <RemoveIcon/>
                            </button>
                        </div>
                    )
                })}
            </CollapsibleGroup>
            <CollapsibleGroup header={"Equipped"}>
                { equipped.map((data) => {
                    const item = new ItemData(data.metadata)
                    return (
                        <div key={String(data.id)} className={styles.spellItem}>
                            <b>{item.name}</b>
                            {item.typeName}
                            <button 
                                tooltips="Remove"
                                onClick={() => handleRemoveEquipped(data.id)}>
                                <RemoveIcon/>
                            </button>
                        </div>
                    )
                })}
            </CollapsibleGroup>
            <CollapsibleGroup header="Add Item">
                <div className={styles.modifierChoice}>
                    <Elements.Bold>Item: </Elements.Bold>
                    <LinkInput
                        value={null}
                        fileTypes={[FileType.Item]}
                        placeholder="Item ID..."
                        allowRemove={false}
                        onChange={handleChange}/>
                </div>
            </CollapsibleGroup>
        </>
    )
}

export default ItemsPage;