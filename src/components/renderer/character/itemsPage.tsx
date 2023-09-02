import { ChangeEventHandler, useEffect, useMemo, useState } from 'react';
import CollapsibleGroup from 'components/common/collapsibleGroup';
import LinkInput from 'components/common/controls/linkInput';
import DropdownMenu from 'components/common/controls/dropdownMenu';
import RemoveIcon from '@mui/icons-material/Remove';
import EquipIcon from '@mui/icons-material/AddModeratorSharp';
import UnequipIcon from '@mui/icons-material/RemoveModeratorSharp';
import { useFiles } from 'utils/handlers/files';
import { isObjectId } from 'utils/helpers';
import Elements from 'data/elements';
import ItemData from 'data/structures/item';
import { FileContextDispatch } from 'types/context/fileContext';
import { ICharacterStorage } from 'types/database/files/character';
import { IItemMetadata } from 'types/database/files/item';
import { ObjectIdText } from 'types/database';
import { FileType } from 'types/database/files';
import { ItemType } from 'types/database/dnd';
import { FileGetMetadataResult } from 'types/database/responses';
import InventoryItemData from 'types/database/files/inventoryItem';
import styles from 'styles/renderer.module.scss';

type ItemsPageProps = React.PropsWithRef<{
    ids: string[]
    storage: ICharacterStorage
    setStorage: FileContextDispatch["setStorage"]
}>

const equippable = new Set([ItemType.Armor, ItemType.MeleeWeapon, ItemType.RangedWeapon, ItemType.ThrownWeapon, ItemType.Trinket])

const ItemsPage = ({ ids, storage, setStorage }: ItemsPageProps): JSX.Element => {
    const [state, setState] = useState(null);
    const [items] = useFiles<IItemMetadata>(ids, [FileType.Item])
    const attunement = [storage.attunement?.[0] ?? null, storage.attunement?.[1] ?? null, storage.attunement?.[2] ?? null]
    const attunementOptions = useMemo(() => items.reduce((prev, item, index) => 
        item && storage.inventory[String(item.id)]?.equipped && item.metadata?.requiresAttunement
        ? {...prev, [String(item.id)]: items?.[index]?.metadata?.name ?? "-"} 
        : prev, { null: "None" })
    , [items])

    const handleChange = (value: FileGetMetadataResult<IItemMetadata>) => {
        if (!value) return;
        let key = String(value.id)
        setState(value.id)
        if (storage.inventory && key in storage.inventory) {
            setStorage("inventory", {
                ...storage.inventory,
                [key]: { ...storage.inventory[key], quantity: (storage.inventory[key].quantity ?? 1) + 1 }
            } satisfies InventoryItemData)
        } else if (value.type === FileType.Item && value.id) {
            setStorage("inventory", { ...storage.inventory, [String(value.id)]: {} satisfies InventoryItemData })
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
        setStorage("attunement", [...attunement.slice(0, index), value == "null" ? null : value, ...attunement.slice(index + 1)])
    }

    const handleTextChanged: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
        setStorage("inventoryOther", e.target.value)
    }

    useEffect(() => {
        if (state) {
            setState(null)
        }
    }, [state])
    
    /*
    useEffect(() => {
        // This should be handled server-side
        let invalidIds = ids.filter(id => id === undefined || !isObjectId(id))
        if (invalidIds.length > 0) {
            let inventory = { ...storage.inventory }
            invalidIds.forEach(id => {
                delete inventory[String(id)]
            })
            setStorage("inventory", inventory)
        }
        if (attunement.some(id => id && !(isObjectId(id) && ids.includes(String(id))))) {
            setStorage("attunement", undefined)
        }
    }, [ids])
    */
    
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
                    if (!data) return null
                    const item = new ItemData(data.metadata, storage.inventory?.[String(data.id)])
                    const isEquippable = equippable.has(item.type)
                    const isEquiped = isEquippable && item.equipped
                    const isAttuned = attunement.some(x => String(x) === String(data.id))
                    return (
                        <div 
                            key={String(data.id)} 
                            className={styles.inventoryItem}
                            data={String(isEquiped)}>
                            <button
                                tooltips={isEquiped ? "Unequip" : "Equip"}
                                onClick={() => handleEquip(data.id, !isEquiped)}
                                disabled={!isEquippable || isAttuned}>
                                {isEquiped ? <UnequipIcon/> : isEquippable && <EquipIcon/>}
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
                                disabled={isAttuned}
                                onClick={() => handleRemove(data.id)}>
                                <RemoveIcon/>
                            </button>
                        </div>
                    )
                })}
            </CollapsibleGroup>
            <CollapsibleGroup header="Attunement">
                {attunement.map((value, index) => (
                    <DropdownMenu
                        key={index}
                        className={styles.inventoryAttunementDropdown}
                        itemClassName={styles.inventoryAttunementDropdownItem}
                        exclude={attunement.map(x => String(x))?.filter(x => x !== "null" && x !== String(value))}
                        value={value ? String(value) : null}
                        values={attunementOptions}
                        onChange={(value) => handleAttunementChanged(index, value)}/>
                ))}
            </CollapsibleGroup>
            <CollapsibleGroup header="Other">
                <textarea
                    className={styles.inventoryInput}
                    value={storage.inventoryOther ?? ""}
                    onChange={handleTextChanged}/>
            </CollapsibleGroup>
            <CollapsibleGroup header="Add Item">
                <div className={styles.modifierChoice}>
                    <Elements.Bold>Item: </Elements.Bold>
                    <LinkInput
                        value={state}
                        allowedTypes={[FileType.Item]}
                        placeholder="Item ID..."
                        onChange={handleChange}/>
                </div>
            </CollapsibleGroup>
        </>
    )
}

export default ItemsPage;