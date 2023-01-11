import CreatureData from "./creature";
import { CharacterMetadata } from "types/database/files/character";
import { OptionTypes } from "data/optionData";

class CharacterData extends CreatureData
{
    public readonly metadata: CharacterMetadata;

    public get gender(): string {
        return this.metadata.gender ?? OptionTypes["gender"].default
    }

    public get age(): string {
        return this.metadata.age ?? ""
    }

    public get height(): string {
        return this.metadata.height ?? ""
    }

    public get weight(): string {
        return this.metadata.weight ?? ""
    }

    public get raceText(): string {
        return this.metadata.raceText ?? ""
    }

    public get occupation(): string {
        return this.metadata.occupation ?? ""
    }

    public get traits(): string {
        return (this.metadata.traits ?? []).join(', ')
    }

    // Texts

    public get appearance(): string {
        return this.metadata.appearance ?? ""
    }

    public get description(): string {
        return this.metadata.description ?? ""
    }

    public get history(): string {
        return this.metadata.history ?? ""
    }

    public get notes(): string {
        return this.metadata.notes ?? ""
    }
}

export default CharacterData