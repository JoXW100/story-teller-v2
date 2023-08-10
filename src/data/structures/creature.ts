import { getOptionType } from "data/optionData";
import Dice from "utils/data/dice";
import { RollOptions } from "data/elements/roll";
import CreatureStats from "./creatureStats";
import FileData from "./file";
import ModifierCollectionData from "./modifierCollection";
import { Alignment, Attribute, CreatureType, DiceType, MovementType, SizeType, Skill } from "types/database/dnd";
import { CalculationMode, OptionalAttribute, IOptionType } from "types/database/editor";
import { CreatureMetadata } from "types/database/files/creature";
import ICreatureStats from "types/database/files/iCreatureStats";
import { ModifierCollection } from "types/database/files";

const OptionTypeAuto: IOptionType<number> = {
    type: CalculationMode.Auto,
    value: 0
}

class CreatureData extends FileData<CreatureMetadata> implements Required<CreatureMetadata>
{
    protected readonly modifiers: ModifierCollection
    public constructor(metadata: CreatureMetadata, modifiers?: ModifierCollection) {
        super(metadata)
        this.modifiers = modifiers ?? new ModifierCollectionData([]);
    }

    public getStats(): CreatureStats {
        return new CreatureStats({
            str: this.str,
            dex: this.dex,
            con: this.con,
            int: this.int,
            wis: this.wis,
            cha: this.cha,
            proficiency: this.proficiencyValue,
            spellAttribute: this.spellAttribute
        } as ICreatureStats)
    }

    public getAttributeModifier(attribute: Attribute | OptionalAttribute): number {
        let value: number = 10
        switch (attribute) {
            case Attribute.STR:
                value = this.str
                break;
            case Attribute.DEX:
                value = this.dex
                break;
            case Attribute.CON:
                value = this.con
                break;
            case Attribute.INT:
                value = this.int
                break;
            case Attribute.WIS:
                value = this.wis
                break;
            case Attribute.CHA:
                value = this.cha
                break;
            case OptionalAttribute.None:
            default:
                return 0
        }
        return Math.ceil((value - 11) / 2.0)
    }

    public get name(): string {
        return this.metadata.name ?? ""
    }

    public get public(): boolean {
        return this.metadata.public ?? false
    }

    public get type(): CreatureType {
        return this.metadata.type ?? getOptionType("creatureType").default
    }

    public get typeText(): string {
        return getOptionType("creatureType").options[this.type]
    }


    public get size(): SizeType {
        return this.metadata.size ?? getOptionType("creatureSize").default
    }

    public get sizeText(): string {
        return getOptionType("creatureSize").options[this.size]
    }

    public get alignment(): Alignment {
        return this.metadata.alignment ?? getOptionType("alignment").default
    }

    public get alignmentText(): string {
        return getOptionType("alignment").options[this.alignment]
    }

    public get portrait(): string {
        return this.metadata.portrait ?? ""
    }

    public get description(): string {
        return this.metadata.description ?? ""
    }

    public get abilities(): string[] {
        return this.metadata.abilities ?? []
    }

    // Stats

    public get level(): number {
        return this.metadata.level ?? 0
    }

    public get hitDice(): DiceType {
        return this.metadata.hitDice ?? getOptionType("dice").default
    }

    public get hitDiceValue(): number {
        let value = parseInt(String(this.hitDice))
        return isNaN(value) ? 0 : value
    }

    public get numHitDice(): number {
        return this.level + this.modifiers.bonusNumHealthDice
    }

    public get health(): IOptionType<number> {
        return this.metadata.health ?? OptionTypeAuto
    }

    public get healthValue(): number {
        let value = this.health.value ?? 0;
        switch (this.health.type) {
            case CalculationMode.Override:
                return value + this.modifiers.bonusHealth;
            case CalculationMode.Modify:
                var mod: number = this.getAttributeModifier(Attribute.CON)
                return Dice.average(this.hitDice, this.numHitDice) + mod * this.level + value + this.modifiers.bonusHealth
            case CalculationMode.Auto:
            default:
                var mod: number = this.getAttributeModifier(Attribute.CON)
                return Dice.average(this.hitDice, this.numHitDice) + mod * this.level + this.modifiers.bonusHealth
        }
    }

    public get healthRoll(): RollOptions {
        let value = this.health.value ?? 0;
        switch (this.health.type) {
            case CalculationMode.Override:
                return {
                    dice: "0",
                    num: "0",
                    mod: String(value + this.modifiers.bonusHealth),
                    desc: "Max health"
                } as RollOptions;
            default:
            case CalculationMode.Auto:
                value = 0;
            case CalculationMode.Modify:
                var mod: number = this.getAttributeModifier(Attribute.CON)
                return {
                    dice: String(this.hitDice),
                    num: String(this.numHitDice),
                    mod: String(mod * this.level + value + this.modifiers.bonusHealth),
                    desc: "Max health"
                } as RollOptions
        }
    }

    public get ac(): IOptionType<number> {
        return this.metadata.ac ?? OptionTypeAuto
    }

    public get acValue(): number {
        let value = this.ac.value ?? 0;
        switch (this.ac.type) {
            case CalculationMode.Override:
                return value + this.modifiers.bonusAC;
            case CalculationMode.Modify:
                var mod: number = this.getAttributeModifier(Attribute.DEX);
                return 10 + mod + value + this.modifiers.bonusAC;
            case CalculationMode.Auto:
            default:
                return 10 + this.getAttributeModifier(Attribute.DEX) + this.modifiers.bonusAC;
        }
    }

    public get proficiency(): IOptionType<number> {
        return this.metadata.proficiency ?? OptionTypeAuto
    }

    public get proficiencyValue(): number {
        let value: number = this.proficiency.value ?? 0
        switch (this.proficiency.type) {
            case CalculationMode.Override:
                return value + this.modifiers.bonusProficiency
            case CalculationMode.Modify:
                return Math.floor(Math.max(this.level - 1, 0) / 4) + 2 + value + this.modifiers.bonusProficiency;
            case CalculationMode.Auto:
            default:
                return Math.floor(Math.max(this.level - 1, 0) / 4) + 2 + this.modifiers.bonusProficiency
        }
    }

    public get initiative(): IOptionType<number> {
        return this.metadata.initiative ?? OptionTypeAuto
    }

    public get initiativeValue(): number {
        let value: number = this.initiative.value ?? 0
        switch (this.initiative.type) {
            case CalculationMode.Override:
                return value + this.modifiers.bonusInitiative;
            case CalculationMode.Modify:
                var mod: number = this.getAttributeModifier(Attribute.DEX);
                return mod + value + this.modifiers.bonusInitiative;
            case CalculationMode.Auto:
            default:
                return this.getAttributeModifier(Attribute.DEX) + this.modifiers.bonusInitiative;
        }
    }

    public get resistances(): string {
        return this.metadata.resistances ?? ""
    }

    public get advantages(): string {
        return this.metadata.advantages ?? ""
    }

    public get vulnerabilities(): string {
        return this.metadata.vulnerabilities ?? ""
    }

    public get dmgImmunities(): string {
        return this.metadata.dmgImmunities ?? ""
    }

    public get conImmunities(): string {
        return this.metadata.conImmunities ?? ""
    }

    public get speed(): Partial<Record<MovementType, number>> {
        return this.metadata.speed ?? {}
    }

    // Attributes

    public get str(): number {
        return this.metadata.str ?? 10
    }

    public get dex(): number {
        return this.metadata.dex ?? 10
    }

    public get con(): number {
        return this.metadata.con ?? 10
    }

    public get int(): number {
        return this.metadata.int ?? 10
    }

    public get wis(): number {
        return this.metadata.wis ?? 10
    }

    public get cha(): number {
        return this.metadata.cha ?? 10
    }

    // Info

    public get saves(): Partial<Record<Attribute, number>> {
        return this.metadata.saves ?? {}
    }

    public get skills(): Partial<Record<Skill, number>> {
        return this.metadata.skills ?? {}
    }

    public get senses(): string {
        return this.metadata.senses ?? ""
    }
    
    public get languages(): string {
        return this.metadata.languages ?? ""
    }

    public get challenge(): number {
        return this.metadata.challenge ?? 0
    }

    public get xp(): number {
        return this.metadata.xp ?? 0
    }

    public get challengeText():string {
        let fraction: string = this.challenge > 0
            ? (this.challenge < 1
                ? `1/${Math.floor(1/this.challenge)}` 
                : String(this.challenge)) 
            : '0'
        return `${fraction} (${this.xp} XP)`
    }

    // Spells

    public get spellAttribute(): OptionalAttribute {
        return this.metadata.spellAttribute ?? getOptionType("optionalAttr").default
    }

    public get spellSlots(): number[] {
        return this.metadata.spellSlots ?? []
    }

    public get spells(): string[] {
        return this.metadata.spells ?? []
    }

    public get spellAttackModifier(): number {
        return this.getAttributeModifier(this.spellAttribute) + this.proficiencyValue
    }

    public get spellSaveModifier(): number {
        return this.getAttributeModifier(this.spellAttribute) + this.proficiencyValue + 8
    }
}

export default CreatureData
export {
    OptionTypeAuto
}