import ItemData from "./item";
import ModifierCollection from "./modifierCollection";
import { IAbilityMetadata } from "types/database/files/ability";
import { IItemMetadata } from "types/database/files/item";
import { IItemCollection } from "types/database/files/itemCollection";
import { IModifierCollection } from "types/database/files/modifierCollection";
import { ItemType } from "types/database/dnd";
import { ICharacterStorage } from "types/database/files/character";


class ItemCollection implements IItemCollection {
    protected readonly items: ItemData[]
    protected readonly storage: ICharacterStorage

    constructor(items: IItemMetadata[], storage: ICharacterStorage) {
        this.items = (items ?? []).map(item => new ItemData(item))
        this.storage = storage
    }

    public get ac(): number {
        return this.items.reduce<number>((prev, item) => item.type === ItemType.Armor ? prev + item.ac : prev, 0)
    }

    public get limitsDex(): boolean {
        return this.items.some(item => item.type === ItemType.Armor && item.limitsDex)
    }

    public get maxDex(): number {
        return this.items.reduce<number>((prev, item) => item.type === ItemType.Armor && item.limitsDex ? Math.min(prev, item.maxDex) : prev, Number.MAX_VALUE)
    }

    public get abilities(): IAbilityMetadata[] {
        return []
    }

    public get modifiers(): IModifierCollection {
        return new ModifierCollection([], this.storage)
    }
}

export default ItemCollection