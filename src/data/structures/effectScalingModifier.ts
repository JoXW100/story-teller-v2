import { getOptionType } from "data/optionData";
import { OptionTypeAuto } from "./creature";
import { DiceType } from "types/database/dnd";
import { IOptionType } from "types/database/editor";
import { IEffectScalingModifier, EffectScaling, EffectScalingModifierType } from "types/database/files/iEffect";

class EffectScalingModifier implements Required<IEffectScalingModifier> {
    private readonly metadata: IEffectScalingModifier;

    public constructor(metadata: IEffectScalingModifier) {
        this.metadata = metadata ?? { id: "" }
    }
    
    public get id(): string {
        return this.metadata.id;
    }

    public get scaling(): EffectScaling {
        return this.metadata.scaling ?? getOptionType("effectScaling").default
    }

    public get scalingValue(): number {
        return this.metadata.scalingValue ?? 0
    }

    public get type(): EffectScalingModifierType {
        return this.metadata.type ?? getOptionType("effectScalingModifier").default
    }

    public get dice(): DiceType {
        return this.metadata.dice ?? getOptionType("dice").default
    }

    public get diceNum(): number {
        return this.metadata.diceNum ?? 0
    }

    public get modifier(): IOptionType<number> {
        return this.metadata.modifier ?? OptionTypeAuto
    }
}

export default EffectScalingModifier