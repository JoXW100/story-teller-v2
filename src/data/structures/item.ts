import { getOptionType } from "data/optionData";
import FileData from "./file";
import ModifierData from "./modifier";
import { ArmorType, ItemType, MeleeWeaponType, RangedWeaponType, Rarity, ThrownWeaponType } from "types/database/dnd";
import { IItemMetadata } from "types/database/files/item";

class ItemData extends FileData<IItemMetadata> implements Required<IItemMetadata> {
    private readonly id?: string;
    constructor(metadata: IItemMetadata, id?: string) {
        super(metadata)
        this.id = id;
    }

    public get type(): ItemType {
        return this.metadata.type ?? getOptionType('itemType').default
    }

    public get typeName(): string {
        return getOptionType('itemType').options[this.type] ?? String(this.type)
    }

    public get rarity(): Rarity {
        return this.metadata.rarity ?? getOptionType('rarity').default
    }

    public get rarityName(): string {
        return getOptionType('rarity').options[this.rarity] ?? String(this.rarity)
    }

    public get requiresAttunement(): boolean {
        return this.metadata.requiresAttunement ?? false
    }

    // Subtype

    public get armorType(): ArmorType {
        return this.metadata.armorType ?? getOptionType('armor').default
    }

    public get meleeWeaponType(): MeleeWeaponType {
        return this.metadata.meleeWeaponType ?? getOptionType('meleeWeapon').default
    }

    public get rangedWeaponType(): RangedWeaponType {
        return this.metadata.rangedWeaponType ?? getOptionType('rangedWeapon').default
    }

    public get thrownWeaponType(): ThrownWeaponType {
        return this.metadata.thrownWeaponType ?? getOptionType('thrownWeapon').default
    }

    public get subTypeName(): string {
        switch (this.type) {
            case ItemType.Armor:
                return getOptionType('armor').options[this.armorType]
            case ItemType.MeleeWeapon:
                return getOptionType('meleeWeapon').options[this.meleeWeaponType]
            case ItemType.RangedWeapon:
                return getOptionType('rangedWeapon').options[this.rangedWeaponType]
            case ItemType.ThrownWeapon:
                return getOptionType('thrownWeapon').options[this.thrownWeaponType]
            case ItemType.Trinket:
            case ItemType.Consumable:
            default:
                return null
        }
    }

    // Modifiers

    public get modifiers(): ModifierData[] {
        return (this.metadata.modifiers ?? []).map((modifier) => new ModifierData(modifier, this.id))
    }
}

export default ItemData