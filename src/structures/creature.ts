import { OptionTypes } from "data/optionData";
import Dice from "utils/data/dice";
import { RollOptions } from "elements/roll";
import CreatureStats from "./creatureStats";
import FileData from "./file";
import { Alignment, Attribute, CreatureType, DiceType, MovementType, SizeType, Skill } from "types/database/dnd";
import { CalculationMode, OptionalAttribute, OptionType } from "types/database/editor";
import { CreatureMetadata } from "types/database/files/creature";
import ICreatureStats from "types/database/files/iCreatureStats";

const OptionTypeAuto: OptionType<number> = {
    type: CalculationMode.Auto,
    value: 0
}

class CreatureData extends FileData<CreatureMetadata> implements Required<CreatureMetadata>
{
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
        return this.metadata.type ?? OptionTypes["creatureType"].default
    }

    public get typeText(): string {
        return OptionTypes["creatureType"].options[this.type]
    }


    public get size(): SizeType {
        return this.metadata.size ?? OptionTypes["creatureSize"].default
    }

    public get sizeText(): string {
        return OptionTypes["creatureSize"].options[this.size]
    }

    public get alignment(): Alignment {
        return this.metadata.alignment ?? OptionTypes["alignment"].default
    }

    public get alignmentText(): string {
        return OptionTypes["alignment"].options[this.alignment]
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
        return this.metadata.hitDice ?? OptionTypes["dice"].default
    }

    public get health(): OptionType<number> {
        return this.metadata.health ?? OptionTypeAuto
    }

    public get healthValue(): number {
        let value = this.health.value ?? 0;
        switch (this.health.type) {
            case CalculationMode.Override:
                return value;
            case CalculationMode.Modify:
                var mod: number = this.getAttributeModifier(Attribute.CON)
                return Dice.average(this.hitDice, this.level) + mod * this.level + value
            case CalculationMode.Auto:
            default:
                var mod: number = this.getAttributeModifier(Attribute.CON)
                return Dice.average(this.hitDice, this.level) + mod * this.level
        }
    }

    public get healthRoll(): RollOptions {
        let value = this.health.value ?? 0;
        switch (this.health.type) {
            case CalculationMode.Override:
                return {
                    dice: "0",
                    num: "0",
                    mod: String(value),
                    desc: "Max health"
                } as RollOptions;
            case CalculationMode.Modify:
                var mod: number = this.getAttributeModifier(Attribute.CON)
                return {
                    dice: String(this.hitDice),
                    num: String(this.level),
                    mod: String(mod * this.level + value),
                    desc: "Max health"
                } as RollOptions
            case CalculationMode.Auto:
            default:
                var mod: number = this.getAttributeModifier(Attribute.CON)
                return {
                    dice: String(this.hitDice),
                    num: String(this.level),
                    mod: String(mod * this.level),
                    desc: "Max health"
                } as RollOptions
        }
    }

    public get ac(): OptionType<number> {
        return this.metadata.ac ?? OptionTypeAuto
    }

    public get acValue(): number {
        let value = this.ac.value ?? 0;
        switch (this.ac.type) {
            case CalculationMode.Override:
                return value;
            case CalculationMode.Modify:
                var mod = this.getAttributeModifier(Attribute.DEX);
                return 10 + mod + value;
            case CalculationMode.Auto:
            default:
                return 10 + this.getAttributeModifier(Attribute.DEX);
        }
    }

    public get proficiency(): OptionType<number> {
        return this.metadata.proficiency ?? OptionTypeAuto
    }

    public get proficiencyValue(): number {
        let value: number = this.proficiency.value ?? 0
        switch (this.proficiency.type) {
            case CalculationMode.Override:
                return value
            case CalculationMode.Modify:
                return Math.floor(Math.max(this.level - 1, 0) / 4) + 2 + value;
            case CalculationMode.Auto:
            default:
                return Math.floor(Math.max(this.level - 1, 0) / 4) + 2
        }
    }

    public get initiative(): OptionType<number> {
        return this.metadata.initiative ?? OptionTypeAuto
    }

    public get initiativeValue(): number {
        let value: number = this.initiative.value ?? 0
        switch (this.initiative.type) {
            case CalculationMode.Override:
                return value;
            case CalculationMode.Modify:
                var mod = this.getAttributeModifier(Attribute.DEX);
                return mod + value;
            case CalculationMode.Auto:
            default:
                return this.getAttributeModifier(Attribute.DEX);
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
        return this.metadata.spellAttribute ?? OptionTypes["optionalAttr"].default
    }

    public get spellSlots(): number[] {
        return this.metadata.spellSlots ?? []
    }

    public get spells(): string[] {
        return this.metadata.spells ?? []
    }
}

export default CreatureData
export {
    OptionTypeAuto
}