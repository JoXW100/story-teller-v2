import { getOptionType } from "data/optionData";
import Dice from "utils/data/dice";
import { asEnum, isEnum } from "utils/helpers";
import { RollOptions } from "data/elements/roll";
import CreatureStats from "./creatureStats";
import FileData from "./file";
import ModifierCollectionData from "./modifierCollection";
import { Alignment, ArmorType, Attribute, CreatureType, DiceType, Language, MovementType, OptionalAttribute, ProficiencyLevel, Sense, SizeType, Skill, Tool, WeaponType } from "types/database/dnd";
import { CalculationMode, IOptionType, OptionTypeAuto } from "types/database/editor";
import ICreatureStats from "types/database/files/iCreatureStats";
import { ICreatureMetadata } from "types/database/files/creature";
import { IModifierCollection } from "types/database/files/modifierCollection";
import { ObjectIdText } from "types/database";
import { RollType } from "types/dice";
import { getProficiencyLevelValue } from "utils/calculations";

class CreatureData<T extends ICreatureMetadata = ICreatureMetadata> extends FileData<T> implements Required<ICreatureMetadata> {
    public readonly modifiers: IModifierCollection
    public constructor(metadata: T, modifiers?: IModifierCollection) {
        super(metadata)
        this.modifiers = modifiers ?? new ModifierCollectionData([], {});
    }

    public getStats(): CreatureStats {
        return new CreatureStats({
            level: this.level,
            str: this.str,
            dex: this.dex,
            con: this.con,
            int: this.int,
            wis: this.wis,
            cha: this.cha,
            multiAttack: this.multiAttack,
            bonusDamage: this.bonusDamage,
            proficiency: this.proficiencyValue,
            spellAttribute: this.spellAttribute,
            critRange: this.critRange
        } satisfies Required<ICreatureStats>)
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
        let mod = Math.ceil(this.proficiencyValue * getProficiencyLevelValue(this.proficienciesSkill[skill]))
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
                return Math.ceil(Dice.average(this.hitDice)) * this.numHitDice + mod * this.level + value + this.modifiers.bonusHealth
            case CalculationMode.Auto:
            default:
                var mod: number = this.getAttributeModifier(Attribute.CON)
                return Math.ceil(Dice.average(this.hitDice)) * this.numHitDice + mod * this.level + this.modifiers.bonusHealth
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
                    type: RollType.Health,
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
                    type: RollType.Health,
                    desc: "Max health"
                } as RollOptions
        }
    }

    public get ac(): IOptionType<number> {
        return this.metadata.ac ?? OptionTypeAuto
    }

    public get acBase(): number {
        return 10
    }

    public get acScalingValue(): number {
        let max = this.modifiers.maxDEXBonus
        let dex = this.getAttributeModifier(Attribute.DEX)
        return max !== null ? Math.min(dex, max) : dex
    }

    public get acValue(): number {
        let value = this.ac.value ?? 0;
        switch (this.ac.type) {
            case CalculationMode.Override:
                return value + this.modifiers.bonusAC;
            case CalculationMode.Modify:
                return this.acBase + this.acScalingValue + value + this.modifiers.bonusAC;
            case CalculationMode.Auto:
            default:
                return this.acBase + this.acScalingValue + this.modifiers.bonusAC;
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

    public get multiAttack(): number {
        return this.modifiers.multiAttack ?? 1
    }

    public get bonusDamage(): number {
        return this.modifiers.bonusDamage ?? 0
    }

    public get critRange(): number {
        return this.modifiers.critRange ?? this.metadata.critRange ?? 20
    }

    public get resistances(): string {
        let splits = (this.metadata.resistances ?? "").split(/ *, */)
        return this.modifiers.modifyResistances(splits).join(', ')
    }

    public get advantages(): string {
        let splits = (this.metadata.advantages ?? "").split(/ *, */)
        return this.modifiers.modifyAdvantages(splits).join(', ')
    }

    public get disadvantages(): string {
        let splits = (this.metadata.disadvantages ?? "").split(/ *, */)
        return this.modifiers.modifyDisadvantages(splits).join(', ')
    }

    public get vulnerabilities(): string {
        let splits = (this.metadata.vulnerabilities ?? "").split(/ *, */)
        return this.modifiers.modifyVulnerabilities(splits).join(', ')
    }

    public get dmgImmunities(): string {
        let splits = (this.metadata.dmgImmunities ?? "").split(/ *, */)
        return this.modifiers.modifyDMGImmunities(splits).join(', ')
    }

    public get conImmunities(): string {
        let splits = (this.metadata.conImmunities ?? "").split(/ *, */)
        return this.modifiers.modifyCONImmunities(splits).join(', ')
    }

    public get speed(): Record<MovementType, number> {
        return Object.values(MovementType).reduce<Record<MovementType, number>>((prev, type) => (
            { ...prev, [type]: (this.metadata.speed?.[type] ?? 0) + this.modifiers.getMovementBonus(type) }
        ), {} as any)
    }

    public get speedAsText(): string {
        let options = getOptionType("movement").options;
        let speed = this.speed
        return Object.keys(speed).reduce<string[]>((prev, type: MovementType) => (
            speed[type] > 0 ? [...prev, `${options[type]} ${speed[type]}ft`] : prev
        ), []).join(', ')
    }

    public get senses(): Record<Sense, number> {
        return Object.values(Sense).reduce<Record<Sense, number>>((prev, sense) => (
            { ...prev, [sense]: this.getSenseRange(sense) }
        ), {} as any)
    }

    public get sensesAsText(): string {
        let options = getOptionType("sense").options;
        let senses = this.senses
        return Object.keys(senses).reduce<string[]>((prev, sense: Sense) => (
            senses[sense] > 0 ? [...prev, `${options[sense]} ${senses[sense]}ft`] : prev
        ), []).join(', ')
    }

    public getSenseRange(sense: Sense) {
        return Math.max(this.modifiers.getSenseRange(sense), this.metadata.senses?.[sense] ?? 0)
    }

    public get passivePerceptionValue(): number {
        let proficiency = Skill.Perception in this.proficienciesSkill ? this.proficiencyValue : 0
        return 10 + this.getAttributeModifier(Attribute.WIS) + proficiency
    }

    public get passiveInvestigationValue(): number {
        let proficiency = Skill.Investigation in this.proficienciesSkill ? this.proficiencyValue : 0
        return 10 + this.getAttributeModifier(Attribute.INT) + proficiency
    }

    public get passiveInsightValue(): number {
        let proficiency = Skill.Insight in this.proficienciesSkill ? this.proficiencyValue : 0
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
    
    public get proficienciesSkill(): Partial<Record<Skill, ProficiencyLevel>> {
        return this.modifiers.modifyProficienciesSkill(this.metadata.proficienciesSkill ?? {})
    }
    
    public get proficienciesWeapon(): WeaponType[] {
        return this.modifiers.modifyProficienciesWeapon(this.metadata.proficienciesWeapon ?? [])
    }

    public get proficienciesWeaponText(): string {
        let weapon = getOptionType('weaponProficiency').options;
        return this.proficienciesWeapon.map((key) => weapon[key]).join(', ')
    }
    
    public get proficienciesArmor(): ArmorType[] {
        return this.modifiers.modifyProficienciesArmor(this.metadata.proficienciesArmor ?? [])
    }

    public get proficienciesArmorText(): string {
        let armor = getOptionType('armor').options;
        return this.proficienciesArmor.map((key) => armor[key]).join(', ')
    }
    
    public get proficienciesTool(): Partial<Record<Tool, ProficiencyLevel>> {
        return this.modifiers.modifyProficienciesTool(this.metadata.proficienciesTool ?? {})
    }

    public get proficienciesToolText(): string {
        let tool = getOptionType('tool').options;
        return Object.keys(this.proficienciesTool).map((key) => tool[key]).join(', ')
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
        return asEnum(this.modifiers.spellAttribute, OptionalAttribute) ?? this.metadata.spellAttribute ?? getOptionType("optionalAttr").default
    }

    public get spellSlots(): number[] {
        return this.metadata.spellSlots ?? []
    }

    public get spells(): ObjectIdText[] {
        return this.modifiers.modifySpells(this.metadata.spells ?? [])
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