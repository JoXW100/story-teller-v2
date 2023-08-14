import { ObjectId } from "mongodb";
import FileData from "./file";
import ModifierData from "./modifier";
import ModifierCollectionData from "./modifierCollection";
import { getOptionType } from "data/optionData";
import { DiceType } from "types/database/dnd";
import { ICharacterStorage } from "types/database/files/character";
import { IClassMetadata, IClassMetadataProperties } from "types/database/files/class";
import { IModifier } from "types/database/files/modifier";
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

    public get hitDice(): DiceType {
        return this.metadata.hitDice ?? getOptionType("dice").default
    }

    public get subclassLevel(): number {
        return this.metadata.subclassLevel ?? 1;
    }

    public get subclasses(): ObjectId[] {
        return this.metadata.subclasses ?? [];
    }

    public getModifiers(level: number, subclass?: ClassData): IModifierCollection {
        let collection: IModifierCollection = null
        
        if (level >= this.subclassLevel) {
            collection = subclass?.getModifiers(level);
        }

        for (let index = 1; index < level; index++) {
            let modifiers: IModifier[] = this.metadata[index] ?? []
            if (modifiers.length > 0) {
                let newCollection = new ModifierCollectionData(modifiers.map((modifier) => new ModifierData(modifier, this.id)), this.storage)
                collection = newCollection.join(collection)
            }
        }
        return collection
    }
}

export default ClassData