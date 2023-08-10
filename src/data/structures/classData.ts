import FileData from "./file";
import ModifierData from "./modifier";
import { getOptionType } from "data/optionData";
import { ClassMetadata } from "types/database/files/class";
import { Modifier } from "types/database/files";
import { DiceType } from "types/database/dnd";

class ClassData extends FileData<ClassMetadata> implements Required<ClassMetadata>
{
    public get name(): string {
        return this.metadata.name ?? ""
    }

    public get description(): string {
        return this.metadata.description ?? ""
    }

    public get hitDice(): DiceType {
        return this.metadata.hitDice ?? getOptionType("dice").default
    }

    public get modifiers(): Modifier[] {
        return (this.metadata.modifiers ?? []).map((modifier) => new ModifierData(modifier))
    }
}

export default ClassData