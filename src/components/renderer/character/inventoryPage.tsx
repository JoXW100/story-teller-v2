import { ChangeEventHandler, useEffect, useMemo, useState } from 'react';
import CollapsibleGroup from 'components/common/collapsibleGroup';
import LinkInput from 'components/common/controls/linkInput';
import DropdownMenu from 'components/common/controls/dropdownMenu';
import RemoveIcon from '@mui/icons-material/Remove';
import EquipIcon from '@mui/icons-material/AddModeratorSharp';
import UnequipIcon from '@mui/icons-material/RemoveModeratorSharp';
import Elements from 'data/elements';
import type ItemData from 'data/structures/item';
import Localization from 'utils/localization';
import { FileType } from 'types/database/files';
import { ItemType } from 'types/database/dnd';
import type { FileContextDispatch } from 'types/context/fileContext';
import type { ICharacterStorage } from 'types/database/files/character';
import type { IItemMetadata } from 'types/database/files/item';
import type { ObjectIdText } from 'types/database';
import type { FileGetMetadataResult } from 'types/database/responses';
import type InventoryItemData from 'types/database/files/inventoryItem';
import styles from 'styles/renderer.module.scss';

type ItemsPageProps = React.PropsWithRef<{
    items: Record<string, ItemData>
    storage: ICharacterStorage
    setStorage: FileContextDispatch["setStorage"]
}>

const equippable = new Set([ItemType.Armor, ItemType.MeleeWeapon, ItemType.RangedWeapon, ItemType.ThrownWeapon, ItemType.Trinket])

const InventoryPage = ({ items, storage, setStorage }: ItemsPageProps): JSX.Element => {
    const [state, setState] = useState(null);
    const attunement = [storage.attunement?.[0] ?? null, storage.attunement?.[1] ?? null, storage.attunement?.[2] ?? null]
    const attunementOptions = useMemo(() => {
        let options: Record<string, string> = { null: "None" }
        for (const key in items) {
            const item = items[key]
            if (item && storage.inventory[key]?.equipped && item.requiresAttunement) {
                options[key] = item.name ?? "-"
            }
        }
        return options
    }, [items])

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
        if (key && id) {
            setStorage("inventory", {
                ...storage.inventory,
                [key]: { ...storage.inventory[key], equipped: value }
            } satisfies InventoryItemData)
        }
    }

    const handleAttunementChanged = (index: number, value: string) => {
        setStorage("attunement", [...attunement.slice(0, index), value == "null" ? null : value, ...attunement.slice(index + 1)])
    }

    const handleTextChanged: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
        setStorage("inventoryOther", e.target.value)
    }

    const handleSort = (a: ItemData, b: ItemData): number => {
        if (b.equipped === a.equipped) {
            return b.name.localeCompare(a.name)
        }
        return -a.equipped
    }

    useEffect(() => {
        if (state) {
            setState(null)
        }
    }, [state])
    
    return (
        <>
            <CollapsibleGroup header={"Inventory"}>
                <div className={styles.inventoryHeader}>
                    <b tooltips={Localization.toText("character-inventory-equipped-tooltips")}>
                        {Localization.toText("character-inventory-equipped")}
                    </b>
                    <b tooltips={Localization.toText("character-inventory-name-tooltips")}>
                        {Localization.toText("character-inventory-name")}
                    </b>
                    <b tooltips={Localization.toText("character-inventory-weight-tooltips")}>
                        {Localization.toText("character-inventory-weight")}
                    </b>
                    <b tooltips={Localization.toText("character-inventory-quantity-tooltips")}>
                        {Localization.toText("character-inventory-quantity")}
                    </b>
                    <b tooltips={Localization.toText("character-inventory-value-tooltips")}>
                        {Localization.toText("character-inventory-value")}
                    </b>
                </div>
                { Object.values(items)
                    .sort(handleSort)
                    .map((item) => {
                    const isEquippable = equippable.has(item.type)
                    const isEquiped = isEquippable && item.equipped
                    return (
                        <div 
                            key={String(item.id)} 
                            className={styles.inventoryItem}
                            data={String(isEquiped)}>
                            <button
                                tooltips={isEquiped 
                                    ? Localization.toText("character-inventory-unequip") 
                                    : Localization.toText("character-inventory-equip")}
                                onClick={() => handleEquip(item.id, !item.equipped)}
                                disabled={!isEquippable || item.attuned}>
                                {isEquiped ? <UnequipIcon/> : isEquippable && <EquipIcon/>}
                            </button>
                            <div>
                                <b data={item.rarity}>{item.name}</b>
                                <span>{item.subTypeName}</span>
                            </div>
                            <span>{String(item.totalWeight)}</span>
                            <span>{String(item.quantity)}</span>
                            <span>{String(item.totalValue)}</span>
                            <button 
                                tooltips={Localization.toText("character-inventory-remove")}
                                disabled={item.attuned}
                                onClick={() => handleRemove(item.id)}>
                                <RemoveIcon/>
                            </button>
                        </div>
                    )
                })}
            </CollapsibleGroup>
            <CollapsibleGroup header={Localization.toText("character-inventory-attunement")}>
                {attunement.map((value, index) => (
                    <DropdownMenu
                        key={index}
                        className={styles.inventoryAttunementDropdown}
                        itemClassName={styles.inventoryAttunementDropdownItem}
                        exclude={attunement.map(x => String(x)).filter(x => x !== "null" && x !== String(value))}
                        value={value ? String(value) : null}
                        values={attunementOptions}
                        onChange={(value) => handleAttunementChanged(index, value)}/>
                ))}
            </CollapsibleGroup>
            <CollapsibleGroup header={Localization.toText("character-inventory-other")}>
                <textarea
                    className={styles.inventoryInput}
                    value={storage.inventoryOther ?? ""}
                    onChange={handleTextChanged}/>
            </CollapsibleGroup>
            <CollapsibleGroup header={Localization.toText("character-inventory-add")}>
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

export default InventoryPage;