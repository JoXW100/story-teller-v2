import CreatureData from "./creature";
import { OptionTypes } from "data/optionData";
import { CharacterMetadata } from "types/database/files/character";
import { Gender } from "types/database/dnd";

class CharacterData extends CreatureData implements Required<CharacterMetadata>
{
    public readonly metadata: CharacterMetadata;

    public get gender(): Gender {
        return this.metadata.gender ?? OptionTypes["gender"].default
    }
    public get genderText(): string {
        return  OptionTypes["gender"].options[this.gender]
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

    public get traits(): string[] {
        return this.metadata.traits ?? []
    }

    public get traitsText(): string {
        return this.traits.join(', ')
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