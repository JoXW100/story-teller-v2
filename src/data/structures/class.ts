import { ObjectId } from "mongodb";
import FileData from "./file";
import ModifierData from "./modifier";
import ModifierCollection from "./modifierCollection";
import { getOptionType } from "data/optionData";
import DiceCollection from "utils/data/diceCollection";
import Dice from "utils/data/dice";
import { DiceType, OptionalAttribute } from "types/database/dnd";
import { ICharacterStorage } from "types/database/files/character";
import { IClassMetadata, IClassMetadataProperties } from "types/database/files/class";
import { IModifierCollection } from "types/database/files/modifierCollection";

class ClassData extends FileData<IClassMetadata> implements Required<IClassMetadataProperties>, IClassMetadata {
    public readonly storage: ICharacterStorage
    private readonly id: string

    public constructor(metadata: Partial<IClassMetadata> = {}, storage: ICharacterStorage = {}, id?: string) {
        super(metadata);
        this.storage = storage ?? {};
        this.id = id;
    }

    public get isSubclass(): boolean {
        return this.metadata.isSubclass ?? false;
    }

    public get hasLeveledHitDice(): boolean {
        return this.metadata.hasLeveledHitDice ?? false;
    }

    public get hitDice(): DiceType {
        return this.metadata.hitDice ?? getOptionType("dice").default
    }

    public get hitDiceValue(): number {
        let value = parseInt(String(this.hitDice))
        return isNaN(value) ? 0 : value
    }

    public get leveledHitDice(): DiceType[] {
        return this.metadata.leveledHitDice ?? []
    }

    public getHitDiceCollection(level: number): DiceCollection {
        if (level > 0 && this.hasLeveledHitDice) {
            let mod = parseInt(String(this.leveledHitDice[0]))
            mod = isNaN(mod) ? 0 : mod
            let collection = new DiceCollection(mod)
            for (let l = 1; l < level; l++) {
                collection.add(new Dice(this.leveledHitDice[l]))
            }
            return collection
        } else if (level > 0 && this.hitDice !== DiceType.None) {
            let collection = new DiceCollection(this.hitDiceValue)
            collection.add(new Dice(this.hitDice), level - 1)
            return collection
        } else {
            return new DiceCollection()
        }
    }

    public get subclassLevel(): number {
        return this.metadata.subclassLevel ?? 1;
    }

    public get subclasses(): ObjectId[] {
        return this.metadata.subclasses ?? [];
    }

    public get spellAttribute(): OptionalAttribute {
        return this.metadata.spellAttribute ?? getOptionType("optionalAttr").default
    }

    public get spellSlots(): number[][] {
        return this.metadata.spellSlots ?? []
    }

    public get preparationSlots(): number[] {
        return this.metadata.preparationSlots ?? []
    }
    public get preparationSlotsScaling(): OptionalAttribute {
        return this.metadata.preparationSlotsScaling ?? getOptionType("optionalAttr").default
    }
    public get preparationAll(): boolean {
        return this.metadata.preparationAll ?? false
    }

    public get cantripSlots(): number[] {
        return this.metadata.cantripSlots ?? []
    }

    public get learnedSlots(): number[] {
        return this.metadata.learnedSlots ?? []
    }
    public get learnedAll(): boolean {
        return this.metadata.learnedAll ?? false
    }

    public get canRitualCast(): boolean {
        return this.metadata.canRitualCast ?? false
    }

    public getModifiers(level: number, subclass?: ClassData): IModifierCollection {
        let collection: IModifierCollection = null
        if (level >= this.subclassLevel) {
            collection = subclass?.getModifiers(level);
        }
        let modifiers = []
        for (let index = 1; index <= Math.min(20, level); index++) {
            modifiers = [...modifiers, ...(this.metadata[index] ?? [])].map((modifier) => new ModifierData(modifier, `${this.id}-${index}`))
        }
        return new ModifierCollection(modifiers, this.storage).join(collection)
    }
}

export default ClassData