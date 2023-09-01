import { useEffect, useMemo } from 'react';
import CollapsibleGroup from 'components/common/collapsibleGroup';
import LinkInput from 'components/common/controls/linkInput';
import DropdownMenu from 'components/common/controls/dropdownMenu';
import RemoveIcon from '@mui/icons-material/Remove';
import EquipIcon from '@mui/icons-material/AddModeratorSharp';
import UnequipIcon from '@mui/icons-material/RemoveModeratorSharp';
import { useFiles } from 'utils/handlers/files';
import { isObjectId } from 'utils/helpers';
import Elements from 'data/elements';
import CharacterData from 'data/structures/character';
import ItemData from 'data/structures/item';
import { FileContextDispatch } from 'types/context/fileContext';
import { ICharacterStorage } from 'types/database/files/character';
import { IItemMetadata } from 'types/database/files/item';
import { ObjectIdText } from 'types/database';
import { FileType } from 'types/database/files';
import { ItemType } from 'types/database/dnd';
import InventoryItemData from 'types/database/files/inventoryItem';
import styles from 'styles/renderer.module.scss';

type ItemsPageProps = React.PropsWithRef<{
    character: CharacterData
    storage: ICharacterStorage
    setStorage: FileContextDispatch["setStorage"]
}>

const equippable = new Set([ItemType.Armor, ItemType.MeleeWeapon, ItemType.RangedWeapon, ItemType.ThrownWeapon, ItemType.Trinket])

const ItemsPage = ({ character, storage, setStorage }: ItemsPageProps): JSX.Element => {
    const ids = useMemo(() => Object.keys(storage.inventory ?? {}), [storage.inventory])
    const [items, loading] = useFiles<IItemMetadata>(ids)
    const attunementOptions = useMemo(() => items.reduce((prev, item, index) => 
        item && storage.inventory[String(item.id)]?.equipped && item.metadata?.requiresAttunement
        ? {...prev, [String(item.id)]: items?.[index]?.metadata?.name ?? "-"} 
        : prev, { null: "None" })
    , [items])

    const handleChange = (value: ObjectIdText) => {
        if (!value) return;
        let key = String(value)
        if (storage.inventory && key in storage.inventory) {
            setStorage("inventory", {
                ...storage.inventory,
                [key]: { ...storage.inventory[key], quantity: (storage.inventory[key].quantity ?? 1) + 1 }
            } satisfies InventoryItemData)
        } else {
            setStorage("inventory", { ...storage.inventory, [key]: {} satisfies InventoryItemData })
        }
    }

    const handleRemove = (id: ObjectIdText) => {
        let key = String(id)
        if (storage.inventory?.[key]?.quantity > 1) {
            setStorage("inventory", {
                ...storage.inventory,
                [key]: { ...storage.inventory[key], quantity: (storage.inventory[key].quantity ?? 1) - 1 }
            } satisfies InventoryItemData)
        } else {
            let { [key]: _, ...rest } = storage.inventory  
            setStorage("inventory", rest)
        }
    }

    const handleEquip = (id: ObjectIdText, value: boolean) => {
        let key = String(id)
        setStorage("inventory", {
            ...storage.inventory,
            [key]: { ...storage.inventory[key], equipped: value }
        } satisfies InventoryItemData)
    }

    const handleAttunementChanged = (index: number, value: string) => {
        let items = [storage.attunement?.[0] ?? null, storage.attunement?.[1] ?? null, storage.attunement?.[2] ?? null]
        setStorage("attunement", [...items.slice(0, index), value == "null" ? null : value, ...items.slice(index + 1)])
    }

    useEffect(() => {
        // This should be handled server-side
        let invalidIds = ids.filter(id => id === undefined || !isObjectId(id))
        if (invalidIds.length > 0) {
            let inventory = { ...storage.inventory }
            invalidIds.forEach(id => {
                delete inventory[id]
            })
            setStorage("inventory", inventory)
        }
        if (storage.attunement?.some(id => id && !(isObjectId(id) && ids.includes(String(id))))) {
            setStorage("attunement", undefined)
        }
    }, [ids])

    useEffect(() => {
        let invalidIds = items.reduce((prev, item) => item?.type !== FileType.Item ? [...prev, item.id] : prev, [])
        if (invalidIds.length > 0) {
            let inventory = { ...storage.inventory }
            invalidIds.forEach(id => {
                delete inventory[id]
            })
        }
    }, [items])
    
    return (
        <>
            <CollapsibleGroup header={"Inventory"}>
                <div className={styles.inventoryHeader}>
                    <b tooltips='Equipped'>EQU</b>
                    <b tooltips='Item Name'>NAME</b>
                    <b tooltips='Total Weight (lbs)'>LBS</b>
                    <b tooltips='Quantity'>QTY</b>
                    <b tooltips='Total Value'>VAL</b>
                </div>
                { items.map((data) => {
                    console.log("items", data)
                    if (!data) return null
                    const item = new ItemData(data.metadata, storage.inventory?.[String(data.id)])
                    const isEquippable = equippable.has(item.type)
                    const equiped = isEquippable && item.equipped
                    const isAttuned = storage.attunement?.some(x => String(x) === String(data.id))
                    return (
                        <div 
                            key={String(data.id)} 
                            className={styles.inventoryItem}
                            data={String(equiped)}>
                            <button
                                tooltips={equiped ? "Unequip" : "Equip"}
                                onClick={() => handleEquip(data.id, !equiped)}
                                disabled={!isEquippable || isAttuned}>
                                {equiped ? <UnequipIcon/> : isEquippable && <EquipIcon/>}
                            </button>
                            <div>
                                <b className={styles.rarityLabel} data={item.rarity}>
                                    {item.name}
                                </b>
                                <label>{item.subTypeName}</label>
                            </div>
                            <label>{String(item.totalWeight)}</label>
                            <label>{String(item.quantity)}</label>
                            <label>{String(item.totalValue)}</label>
                            <button 
                                tooltips="Remove"
                                onClick={() => handleRemove(data.id)}
                                disabled={isAttuned}>
                                <RemoveIcon/>
                            </button>
                        </div>
                    )
                })}
            </CollapsibleGroup>
            <CollapsibleGroup header="Attunement">
                {(storage.attunement ?? [null, null, null]).map((value, index) => (
                    <DropdownMenu
                        key={index}
                        className={styles.inventoryAttunementDropdown}
                        itemClassName={styles.inventoryAttunementDropdownItem}
                        exclude={storage.attunement?.map(x => String(x))?.filter(x => x !== "null" && x !== String(value))}
                        value={value ? String(value) : null}
                        values={attunementOptions}
                        onChange={(value) => handleAttunementChanged(index, value)}/>
                ))}
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