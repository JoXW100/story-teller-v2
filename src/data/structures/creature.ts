import { getOptionType } from "data/optionData";
import Dice from "utils/data/dice";
import { asEnum, isEnum } from "utils/helpers";
import { RollOptions } from "data/elements/roll";
import CreatureStats from "./creatureStats";
import FileData from "./file";
import ModifierCollectionData from "./modifierCollection";
import { Alignment, ArmorType, Attribute, CreatureType, DiceType, Language, MovementType, OptionalAttribute, Sense, SizeType, Skill, Tool, WeaponType } from "types/database/dnd";
import { CalculationMode, IOptionType, OptionTypeAuto } from "types/database/editor";
import ICreatureStats from "types/database/files/iCreatureStats";
import { ICreatureMetadata } from "types/database/files/creature";
import { IModifierCollection } from "types/database/files/modifierCollection";
import { ObjectIdText } from "types/database";

class CreatureData extends FileData<ICreatureMetadata> implements Required<ICreatureMetadata> {
    public readonly modifiers: IModifierCollection
    public constructor(metadata: ICreatureMetadata, modifiers?: IModifierCollection) {
        super(metadata)
        this.modifiers = modifiers ?? new ModifierCollectionData([], {});
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
            spellAttribute: this.spellAttribute,
            critRange: this.critRange
        } as ICreatureStats)
    }

    public getValues(): Record<string, number> {
        return {
            str: this.getAttributeModifier(Attribute.STR),
            dex: this.getAttributeModifier(Attribute.DEX),
            con: this.getAttributeModifier(Attribute.CON),
            int: this.getAttributeModifier(Attribute.INT),
            wis: this.getAttributeModifier(Attribute.WIS),
            cha: this.getAttributeModifier(Attribute.CHA),
            proficiency: this.proficiencyValue,
            spellAttribute: this.getAttributeModifier(this.spellAttribute),
            level: this.level,
        }
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

    public getSaveModifier(attribute: Attribute | OptionalAttribute): number {
        let mod = isEnum(attribute, Attribute) && this.proficienciesSave.includes(attribute) 
            ? this.proficiencyValue 
            : 0;
        return this.getAttributeModifier(attribute) + mod
    }

    public getSkillAttribute(skill: Skill): OptionalAttribute {
        switch (skill) {
            case Skill.Athletics:
                return OptionalAttribute.STR;
            case Skill.Acrobatics:
            case Skill.SleightOfHand:
            case Skill.Stealth:
                return OptionalAttribute.DEX;
            case Skill.Arcana:
            case Skill.History:
            case Skill.Investigation:
            case Skill.Nature:
            case Skill.Religion:
                return OptionalAttribute.INT;
            case Skill.AnimalHandling:
            case Skill.Insight:
            case Skill.Medicine:
            case Skill.Perception:
            case Skill.Survival:
                return OptionalAttribute.WIS;
            case Skill.Deception:
            case Skill.Intimidation:
            case Skill.Performance:
            case Skill.Persuasion:
                return OptionalAttribute.CHA;
            default:
                return OptionalAttribute.None
        }
    }

    public getSkillModifier(skill: Skill): number {
        let attr = this.getSkillAttribute(skill)
        let mod = this.proficienciesSkill.includes(skill) 
            ? this.proficiencyValue 
            : 0;
        return this.getAttributeModifier(attr) + mod
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

    public get challenge(): number {
        return this.metadata.challenge ?? 0
    }

    public get challengeText():string {
        let fraction: string = this.challenge > 0
            ? (this.challenge < 1
                ? `1/${Math.floor(1/this.challenge)}` 
                : String(this.challenge)) 
            : '0'
        return `${fraction} (${this.xp} XP)`
    }

    public get xp(): number {
        return this.metadata.xp ?? 0
    }

    public get abilities(): ObjectIdText[] {
        return this.modifiers.modifyAbilities(this.metadata.abilities ?? [])
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

    public get critRange(): number {
        return this.modifiers.critRange ?? this.metadata.critRange ?? 20
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

    public get speedAsText(): string {
        let movement = getOptionType("movement").options;
        return Object.keys(this.speed).map((key) => `${movement[key]} ${this.speed[key]}ft`).join(', ')
    }

    public get senses(): Partial<Record<Sense, number>> {
        return this.metadata.senses ?? {}
    }

    public get sensesAsText(): string {
        let senses = getOptionType("sense").options;
        return Object.keys(this.senses).map((key) => `${senses[key]} ${this.senses[key]}ft`).join(', ')
    }

    public get passivePerceptionValue(): number {
        let proficiency = this.proficienciesSkill.includes(Skill.Perception) ? this.proficiencyValue : 0
        return 10 + this.getAttributeModifier(Attribute.WIS) + proficiency
    }

    public get passiveInvestigationValue(): number {
        let proficiency = this.proficienciesSkill.includes(Skill.Investigation) ? this.proficiencyValue : 0
        return 10 + this.getAttributeModifier(Attribute.INT) + proficiency
    }

    public get passiveInsightValue(): number {
        let proficiency = this.proficienciesSkill.includes(Skill.Insight) ? this.proficiencyValue : 0
        return 10 + this.getAttributeModifier(Attribute.WIS) + proficiency
    }

    // Attributes

    public get str(): number {
        return (this.metadata.str ?? 10) + this.modifiers.getAttributeBonus(Attribute.STR)
    }

    public get dex(): number {
        return (this.metadata.dex ?? 10) + this.modifiers.getAttributeBonus(Attribute.DEX)
    }

    public get con(): number {
        return (this.metadata.con ?? 10) + this.modifiers.getAttributeBonus(Attribute.CON)
    }

    public get int(): number {
        return (this.metadata.int ?? 10) + this.modifiers.getAttributeBonus(Attribute.INT)
    }

    public get wis(): number {
        return (this.metadata.wis ?? 10) + this.modifiers.getAttributeBonus(Attribute.WIS)
    }

    public get cha(): number {
        return (this.metadata.cha ?? 10) + this.modifiers.getAttributeBonus(Attribute.CHA)
    }

    // Proficiencies
    
    public get proficienciesSave(): Attribute[] {
        return this.modifiers.modifyProficienciesSave(this.metadata.proficienciesSave ?? [])
    }
    
    public get proficienciesSkill(): Skill[] {
        return this.modifiers.modifyProficienciesSkill(this.metadata.proficienciesSkill ?? [])
    }
    
    public get proficienciesWeapon(): WeaponType[] {
        return this.modifiers.modifyProficienciesWeapon(this.metadata.proficienciesWeapon ?? [])
    }

    public get proficienciesWeaponText(): string {
        let weapon = getOptionType('weapon').options;
        return this.proficienciesWeapon.map((key) => weapon[key]).join(', ')
    }
    
    public get proficienciesArmor(): ArmorType[] {
        return this.modifiers.modifyProficienciesArmor(this.metadata.proficienciesArmor ?? [])
    }

    public get proficienciesArmorText(): string {
        let armor = getOptionType('armor').options;
        return this.proficienciesArmor.map((key) => armor[key]).join(', ')
    }
    
    public get proficienciesTool(): Tool[] {
        return this.modifiers.modifyProficienciesTool(this.metadata.proficienciesTool ?? [])
    }

    public get proficienciesToolText(): string {
        let tool = getOptionType('tool').options;
        return this.proficienciesTool.map((key) => tool[key]).join(', ')
    }
    
    public get proficienciesLanguage(): Language[] {
        return this.modifiers.modifyProficienciesLanguage(this.metadata.proficienciesLanguage ?? [])
    }

    public get proficienciesLanguageText(): string {
        let language = getOptionType('language').options;
        return this.proficienciesLanguage.map((key) => language[key]).join(', ')
    }

    // Spells

    public get spellAttribute(): OptionalAttribute {
        return this.metadata.spellAttribute ?? getOptionType("optionalAttr").default
    }

    public get spellSlots(): number[] {
        return this.metadata.spellSlots ?? []
    }

    public get spells(): ObjectIdText[] {
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