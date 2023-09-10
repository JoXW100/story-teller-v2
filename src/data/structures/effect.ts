import { getOptionType } from "data/optionData";
import { OptionTypeAuto } from "./creature";
import CreatureStats from "./creatureStats";
import EffectScalingModifier from "./effectScalingModifier";
import { getScalingValue } from "utils/calculations";
import { ScalingType, DiceType, DamageType } from "types/database/dnd";
import { CalculationMode, IOptionType } from "types/database/editor";
import IEffect, { EffectScaling, EffectScalingModifierType, EffectType } from "types/database/files/iEffect";
import ICreatureStats from "types/database/files/iCreatureStats";

class Effect implements Required<IEffect> {
    private readonly metadata: IEffect;
    private readonly stats: ICreatureStats;
    private readonly _spellSlot?: number

    public constructor(metadata: IEffect, stats: ICreatureStats, spellSlot?: number) {
        this.metadata = metadata ?? { id: "" }
        this.stats = new CreatureStats(stats)
        this._spellSlot = spellSlot
    }

    public get id(): string {
        return this.metadata.id;
    }

    public get type(): EffectType {
        return this.metadata.type ?? getOptionType("effectType").default
    }
    

    public get label(): string {
        return this.metadata.label ?? "Effect"
    }

    public get damageType(): DamageType {
        return this.metadata.damageType ?? getOptionType("damageType").default
    }

    public get damageTypeName(): string {
        return getOptionType("damageType").options[this.damageType] ?? String(this.damageType)
    }

    public get text(): string {
        return this.metadata.text ?? ""
    }

    public get scaling(): ScalingType {
        return this.metadata.scaling ?? getOptionType("scaling").default
    }

    public get proficiency(): boolean {
        return this.metadata.proficiency ?? false
    }

    public get modifier(): IOptionType<number> {
        let max = 0;
        return this.scalingModifiers.reduce((prev, mod) => {
            if (this.scalingModifierIsActive(mod) && mod.type === EffectScalingModifierType.Modifier && mod.scalingValue > max) {
                max = mod.scalingValue
                return mod.modifier
            }
            return prev
        }, this.metadata.modifier ?? OptionTypeAuto)
    }

    public get modifierValue(): number {
        let mod = this.modifier.value ?? 0;
        let useProf = this.proficiency;
        let prof = useProf ? this.stats.proficiency : 0;
        let bonus = this.damageType !== DamageType.None && this.type === EffectType.MainDamage ? this.stats.bonusDamage : 0
        switch (this.modifier.type) {
            case CalculationMode.Modify:
                return getScalingValue(this.scaling, this.stats) + mod + prof + bonus
            case CalculationMode.Override:
                return mod + prof + bonus
            case CalculationMode.Auto:
            default:
                return getScalingValue(this.scaling, this.stats) + prof + bonus
            
        }
    }

    public get dice(): DiceType {
        let max = 0;
        return this.scalingModifiers.reduce((prev, mod) => {
            if (this.scalingModifierIsActive(mod) && mod.type === EffectScalingModifierType.DiceSize && mod.scalingValue > max) {
                max = mod.scalingValue
                return mod.dice
            }
            return prev
        }, this.metadata.dice ?? getOptionType("dice").default)
    }

    public get diceNum(): number {
        let max = 0;
        return this.scalingModifiers.reduce((prev, mod) => {
            if (this.scalingModifierIsActive(mod) && mod.type === EffectScalingModifierType.DiceNum && mod.scalingValue > max) {
                max = mod.scalingValue
                return mod.diceNum
            }
            return prev
        }, this.metadata.diceNum ?? 1)
    }

    public get scalingModifiers(): EffectScalingModifier[] {
        return (this.metadata.scalingModifiers ?? []).map(x => new EffectScalingModifier(x))
    }

    private scalingModifierIsActive(modifier: EffectScalingModifier): boolean {
        switch (modifier.scaling) {
            case EffectScaling.CasterLevel:
                return this.stats.casterLevel >= modifier.scalingValue
            case EffectScaling.Level:
                return this.stats.level >= modifier.scalingValue
            case EffectScaling.SpellSlot:
                return this._spellSlot >= modifier.scalingValue
            default:
                return false
        }
    }
}

export default Effect