import ModifierData from "./modifier";
import { IChoice } from "types/database/files/modifier";

class ChoiceData implements Required<IChoice>  {
    private readonly metadata: IChoice;
    private readonly _id?: string

    public constructor(metadata: IChoice, id?: string) {
        this.metadata = metadata ?? { id: "" }
        this._id = id;
    }

    public get id(): string {
        return this._id ? `${this._id}-${this.metadata.id}` : this.metadata.id
    }

    public get label(): string {
        return this.metadata.label
    }

    public get modifiers(): ModifierData[] {
        return (this.metadata.modifiers ?? []).map((modifier) => new ModifierData(modifier, this.id))
    }
}

export default ChoiceData