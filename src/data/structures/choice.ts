import ModifierData from "./modifier";
import { IChoice } from "types/database/files/modifier";

class ChoiceData implements Required<IChoice>  {
    private readonly metadata: IChoice;
    private readonly id?: string

    public constructor(metadata: IChoice, id?: string) {
        this.metadata = metadata ?? { $name: "" }
        this.id = id;
    }

    public get $name(): string {
        return this.id ? `${this.id}-${this.metadata.$name}` : this.metadata.$name
    }

    public get label(): string {
        return this.metadata.label
    }

    public get modifiers(): ModifierData[] {
        return (this.metadata.modifiers ?? []).map((modifier) => new ModifierData(modifier, this.id))
    }
}

export default ChoiceData