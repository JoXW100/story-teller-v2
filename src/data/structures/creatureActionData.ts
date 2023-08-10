import { getOptionType } from "data/optionData";
import FileData from "./file";
import { OptionTypeAuto } from "./creature";
import CreatureStats from "./creatureStats";
import { getAttributeModifier } from "utils/calculations";
import { Attribute, DamageType, DiceType, EffectCondition, ScalingType, TargetType } from "types/database/dnd";
import { CalculationMode, OptionalAttribute, IOptionType } from "types/database/editor";
import ICreatureActionData from "types/database/files/iConditionalHitEffect";
import ICreatureStats from "types/database/files/iCreatureStats";
import { asEnum } from "utils/helpers";

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
        return this.metadata.condition ?? getOptionType("effectCondition").default
    }

    public get saveAttr(): Attribute {
        return this.metadata.saveAttr ?? getOptionType("attr").default
    }

    public get damageType(): DamageType {
        return this.metadata.damageType ?? getOptionType("damageType").default
    }

    public get damageTypeName(): string {
        return  getOptionType("damageType").options[this.damageType] ?? String(this.damageType)
    }

    public get target(): TargetType {
        return this.metadata.target ?? getOptionType("target").default
    }

    // Hit condition roll scaling

    public get conditionScaling(): ScalingType {
        return this.metadata.conditionScaling ?? getOptionType("scaling").default
    }

    public get conditionProficiency(): boolean {
        return this.metadata.conditionProficiency ?? false
    }

    public get conditionModifier(): IOptionType<number> {
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

    public get conditionSaveValue(): number {
        return this.conditionModifierValue + 8
    }

    // Hit effect roll scaling

    public get effectText(): string {
        return this.metadata.effectText ?? ""
    }

    public get effectScaling(): ScalingType {
        return this.metadata.effectScaling ?? getOptionType("scaling").default
    }

    public get effectProficiency(): boolean {
        return this.metadata.effectProficiency ?? false
    }

    public get effectModifier(): IOptionType<number> {
        return this.metadata.effectModifier ?? OptionTypeAuto
    }

    public get effectModifierValue(): number {
        let mod = this.effectModifier.value ?? 0;
        let useProf = this.effectProficiency;
        let prof = useProf ? this.stats.proficiency : 0;
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
        return this.metadata.effectDice ?? getOptionType("dice").default
    }

    public get effectDiceNum(): number {
        return this.metadata.effectDiceNum ?? 0
    }

    private getScalingValue(scaling: ScalingType | Attribute | OptionalAttribute): number {
        switch (scaling) {
            case ScalingType.Finesse:
                return Math.max(this.getScalingValue(ScalingType.DEX), this.getScalingValue(ScalingType.STR));
            case ScalingType.SpellModifier:
                return this.getScalingValue(this.stats.spellAttribute)
            case ScalingType.None:
                return 0;
            default:
                let attribute = asEnum(scaling, Attribute);
                return attribute ? getAttributeModifier(this.stats, attribute) : 0
        }
    }
}

export default CreatureActionData;