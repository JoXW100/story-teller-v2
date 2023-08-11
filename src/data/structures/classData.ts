import FileData from "./file";
import ModifierData from "./modifier";
import { getOptionType } from "data/optionData";
import { ClassMetadata, ClassMetadataProperties } from "types/database/files/class";
import { Modifier, ModifierCollection } from "types/database/files";
import { DiceType } from "types/database/dnd";
import ModifierCollectionData from "./modifierCollection";
import { CharacterStorage } from "types/database/files/character";

class ClassData extends FileData<ClassMetadata> implements Required<ClassMetadataProperties>, ClassMetadata
{
    public readonly storage: CharacterStorage
    private readonly id: string

    public constructor(metadata: ClassMetadata, storage: CharacterStorage, id?: string) {
        super(metadata);
        this.storage = storage ?? {};
        this.id = id;
    }

    public get name(): string {
        return this.metadata.name ?? ""
    }

    public get description(): string {
        return this.metadata.description ?? ""
    }

    public get hitDice(): DiceType {
        return this.metadata.hitDice ?? getOptionType("dice").default
    }

    public getModifiers(level: number): ModifierCollection {
        let collection: ModifierCollection = null
        for (let index = 1; index < level; index++) {
            let modifiers: Modifier[] = this.metadata[index] ?? []
            if (modifiers.length > 0) {
                let newCollection = new ModifierCollectionData(modifiers.map((modifier) => new ModifierData(modifier, this.id)), this.storage)
                collection = newCollection.join(collection)
            }
        }
        return collection
    }
}

export default ClassData