import { OptionTypes } from "data/optionData";
import FileData from "./file";
import { OptionTypeAuto } from "./creature";
import CreatureStats from "./creatureStats";
import { getAttributeModifier } from "utils/calculations";
import { Attribute, DamageType, DiceType, EffectCondition, ScalingType, TargetType } from "types/database/dnd";
import { CalculationMode, OptionType } from "types/database/editor";
import ICreatureActionData from "types/database/files/iConditionalHitEffect";
import ICreatureStats from "types/database/files/iCreatureStats";

abstract class CreatureActionData<T extends ICreatureActionData> extends FileData<T> implements Required<ICreatureActionData> 
{
    public readonly stats: CreatureStats

    constructor(metadata: T, stats: ICreatureStats = null) {
        super(metadata)
        this.stats = new CreatureStats(stats)
    }

    public get name(): string {
        return this.metadata.name ?? ""
    }

    public get public(): boolean {
        return this.metadata.public ?? false
    }

    public get description(): string {
        return this.metadata.description
    }

    public get notes(): string {
        return this.metadata.notes ?? ""
    }

    // Hit condition

    public get condition(): EffectCondition {
        return this.metadata.condition ?? OptionTypes["effectCondition"].default
    }

    public get saveAttr(): Attribute {
        return this.metadata.saveAttr ?? OptionTypes["attr"].default
    }

    public get damageType(): DamageType {
        return this.metadata.damageType ?? OptionTypes["damageType"].default
    }

    public get damageTypeName(): string {
        return OptionTypes["damageType"].options[this.damageType] ?? String(this.damageType)
    }

    public get target(): TargetType {
        return this.metadata.target ?? OptionTypes["target"].default
    }

    // Hit condition roll scaling

    public get conditionScaling(): ScalingType {
        return this.metadata.conditionScaling ?? OptionTypes["scaling"].default
    }

    public get conditionProficiency(): boolean {
        return this.metadata.conditionProficiency ?? false
    }

    public get conditionModifier(): OptionType<number> {
        return this.metadata.conditionModifier ?? OptionTypeAuto
    }

    public get conditionModifierValue(): number {
        let mod = this.conditionModifier.value ?? 0;
        let useProf = this.conditionProficiency;
        let prof = useProf ? this.stats.proficiency ?? 0 : 0;
        switch (this.conditionModifier.type) {
            case CalculationMode.Modify:
                return this.getScalingValue(this.conditionScaling) + mod + prof
            case CalculationMode.Override:
                return mod + prof
            case CalculationMode.Auto:
            default:
                return this.getScalingValue(this.conditionScaling) + prof
        }
    }

    // Hit effect roll scaling

    public get effectText(): string {
        return this.metadata.effectText ?? ""
    }

    public get effectScaling(): ScalingType {
        return this.metadata.effectScaling ?? OptionTypes["scaling"].default
    }

    public get effectProficiency(): boolean {
        return this.metadata.effectProficiency ?? false
    }

    public get effectModifier(): OptionType<number> {
        return this.metadata.effectModifier ?? OptionTypeAuto
    }

    public get effectModifierValue(): number {
        var mod = this.effectModifier.value ?? 0;
        var useProf = this.effectProficiency;
        var prof = useProf ? this.stats.proficiency : 0;
        switch (this.effectModifier.type) {
            case CalculationMode.Modify:
                return this.getScalingValue(this.effectScaling) + mod + prof
            case CalculationMode.Override:
                return mod + prof
            case CalculationMode.Auto:
            default:
                return this.getScalingValue(this.effectScaling) + prof
            
        }
    }

    public get effectDice(): DiceType {
        return this.metadata.effectDice ?? OptionTypes["dice"].default
    }

    public get effectDiceNum(): number {
        return this.metadata.effectDiceNum ?? 0
    }

    private getScalingValue(scaling: ScalingType): number {
        switch (scaling) {
            case ScalingType.Finesse:
                return Math.max(this.getScalingValue(ScalingType.DEX), this.getScalingValue(ScalingType.STR));
            case ScalingType.SpellModifier:
                return this.getScalingValue(ScalingType[this.stats.spellAttribute])
            case ScalingType.None:
                return 0;
            default:
                return scaling in this.stats
                    ? getAttributeModifier(this.stats, scaling as any) 
                    : 0
        }
    }
}

export default CreatureActionData;