import CreatureStats from "./creatureStats";
import FileData from "./file";
import RaceData from "./race";
import ModifierCollectionData from "./modifierCollection";
import { getOptionType } from "data/optionData";
import { RollOptions } from "data/elements/roll";
import Dice from "utils/data/dice";
import DiceCollection from "utils/data/diceCollection";
import { asEnum, isEnum } from "utils/helpers";
import { getProficiencyLevelValue } from "utils/calculations";
import { AdvantageBinding, Alignment, ArmorType, Attribute, CreatureType, DiceType, Language, MovementType, OptionalAttribute, ProficiencyLevel, Sense, SizeType, Skill, Tool, WeaponType } from "types/database/dnd";
import { CalculationMode, IOptionType, OptionTypeAuto } from "types/database/editor";
import ICreatureStats from "types/database/files/iCreatureStats";
import { CreatureValue, ICreatureMetadata } from "types/database/files/creature";
import { IModifierCollection } from "types/database/files/modifierCollection";
import { ObjectIdText } from "types/database";
import { RollType } from "types/dice";
import { ModifierBonusTypeProperty } from "types/database/files/modifier";

class CreatureData<T extends ICreatureMetadata = ICreatureMetadata> extends FileData<T> implements Required<ICreatureMetadata> {
    public readonly race: RaceData
    public readonly modifiers: IModifierCollection
    public constructor(metadata: T, modifiers?: IModifierCollection, race?: RaceData) {
        super(metadata)
        let mods: IModifierCollection = modifiers
        if (race) {
            mods = race.getModifiers().join(mods)
        }
        this.race = race ?? null
        this.modifiers = mods ?? new ModifierCollectionData([], {});
    }

    public getStats(): CreatureStats {
        return new CreatureStats({
            str: this.str,
            dex: this.dex,
            con: this.con,
            int: this.int,
            wis: this.wis,
            cha: this.cha,
            spellAttribute: this.spellAttribute,
            proficiency: this.proficiencyValue,
            level: this.level,
            casterLevel: this.casterLevelValue,
            multiAttack: this.multiAttack,
            bonusDamage: this.bonusDamage,
            critRange: this.critRange
        } satisfies Required<ICreatureStats>)
    }

    public getValues(): Record<CreatureValue, number> {
        return {
            str: this.getAttributeModifier(Attribute.STR),
            dex: this.getAttributeModifier(Attribute.DEX),
            con: this.getAttributeModifier(Attribute.CON),
            int: this.getAttributeModifier(Attribute.INT),
            wis: this.getAttributeModifier(Attribute.WIS),
            cha: this.getAttributeModifier(Attribute.CHA),
            spellAttribute: this.getAttributeModifier(this.spellAttribute),
            proficiency: this.proficiencyValue,
            level: this.level,
            casterLevel: this.casterLevelValue,
        } satisfies Record<CreatureValue, number>
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
        return this.metadata.type ?? this.race?.type ?? getOptionType("creatureType").default
    }

    public get typeText(): string {
        return getOptionType("creatureType").options[this.type]
    }


    public get size(): SizeType {
        return this.modifiers.size ?? this.metadata.size ?? this.race?.size ?? getOptionType("size").default
    }

    public get sizeText(): string {
        return getOptionType("size").options[this.size]
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
        return this.modifiers.modifyAbilities(this.metadata.abilities ?? []) ?? this.metadata.abilities ?? []
    }

    public static abilities = (creature: ICreatureMetadata, modifiers: IModifierCollection): ObjectIdText[] => {
        return modifiers?.modifyAbilities(creature?.abilities ?? []) ?? creature?.abilities ?? []
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
        return this.level + this.modifiers.getBonus(ModifierBonusTypeProperty.NumHitDice)
    }

    public get hitDiceCollection(): DiceCollection {
        if (this.level > 0 && this.hitDice !== DiceType.None) {
            let collection = new DiceCollection(this.hitDiceValue)
            collection.add(this.hitDice, this.level)
            return collection
        } else {
            return new DiceCollection()
        }
    }

    public get health(): IOptionType<number> {
        return this.metadata.health ?? OptionTypeAuto
    }

    public get healthValue(): number {
        let value = this.health.value ?? 0;
        switch (this.health.type) {
            case CalculationMode.Override:
                return value + this.modifiers.getBonus(ModifierBonusTypeProperty.Health);
            case CalculationMode.Auto:
                value = 0
            case CalculationMode.Modify:
                var mod: number = this.getAttributeModifier(Attribute.CON)
                return Math.floor(Dice.average(this.hitDiceValue) * this.numHitDice) + mod * this.level + value + this.modifiers.getBonus(ModifierBonusTypeProperty.Health)
        }
    }

    public get healthRoll(): RollOptions {
        let value = this.health.value ?? 0;
        switch (this.health.type) {
            case CalculationMode.Override:
                return {
                    dice: "0",
                    num: "0",
                    mod: String(value + this.modifiers.getBonus(ModifierBonusTypeProperty.Health)),
                    type: RollType.Health,
                    desc: "Max health"
                } satisfies RollOptions;
            default:
            case CalculationMode.Auto:
                value = 0;
            case CalculationMode.Modify:
                var mod: number = this.getAttributeModifier(Attribute.CON)
                return {
                    dice: String(this.hitDice),
                    num: String(this.numHitDice),
                    mod: String(mod * this.level + value + this.modifiers.getBonus(ModifierBonusTypeProperty.Health)),
                    type: RollType.Health,
                    desc: "Max health"
                } satisfies RollOptions
        }
    }

    public get ac(): IOptionType<number> {
        return this.metadata.ac ?? OptionTypeAuto
    }

    public get acBase(): number {
        let max = this.modifiers.maxDEXBonus
        let dex = this.getAttributeModifier(Attribute.DEX)
        let values: Record<Attribute, number> = {
            [Attribute.STR]: this.getAttributeModifier(Attribute.STR),
            [Attribute.DEX]: max === null ? dex : Math.min(dex, max),
            [Attribute.CON]: this.getAttributeModifier(Attribute.CON),
            [Attribute.INT]: this.getAttributeModifier(Attribute.INT),
            [Attribute.WIS]: this.getAttributeModifier(Attribute.WIS),
            [Attribute.CHA]: this.getAttributeModifier(Attribute.CHA)
        }
        let base = this.modifiers.getACBase(values)
        return base === 0 ? Math.max(10, 10 + values[Attribute.DEX]) : base
    }

    public get acValue(): number {
        let value = this.ac.value ?? 0;
        switch (this.ac.type) {
            case CalculationMode.Override:
                return value + this.modifiers.getBonus(ModifierBonusTypeProperty.AC);
            case CalculationMode.Auto:
                value = 0
            case CalculationMode.Modify:
                return this.acBase + value + this.modifiers.getBonus(ModifierBonusTypeProperty.AC);
        }
    }

    public get proficiency(): IOptionType<number> {
        return this.metadata.proficiency ?? OptionTypeAuto
    }

    public get proficiencyValue(): number {
        let value: number = this.proficiency.value ?? 0
        switch (this.proficiency.type) {
            case CalculationMode.Override:
                return value + this.modifiers.getBonus(ModifierBonusTypeProperty.Proficiency);
            case CalculationMode.Auto:
                value = 0
            case CalculationMode.Modify:
                return Math.floor(Math.max(this.level - 1, 0) / 4) + 2 + value + this.modifiers.getBonus(ModifierBonusTypeProperty.Proficiency);
        }
    }

    public get initiative(): IOptionType<number> {
        return this.metadata.initiative ?? OptionTypeAuto
    }

    public get initiativeValue(): number {
        let value: number = this.initiative.value ?? 0
        switch (this.initiative.type) {
            case CalculationMode.Override:
                return value + this.modifiers.getBonus(ModifierBonusTypeProperty.Initiative);
            case CalculationMode.Auto:
                value = 0
            case CalculationMode.Modify:
                return this.getAttributeModifier(Attribute.DEX) + value + this.modifiers.getBonus(ModifierBonusTypeProperty.Initiative);
        }
    }

    public get multiAttack(): number {
        return this.modifiers.multiAttack ?? 1
    }

    public get bonusDamage(): number {
        return this.modifiers.getBonus(ModifierBonusTypeProperty.Damage)
    }

    public get critRange(): number {
        return this.modifiers.critRange ?? this.metadata.critRange ?? 20
    }

    public get resistances(): string {
        let splits = [...(this.metadata.resistances ?? "").split(/ *, */), ...(this.race?.resistances ?? "").split(/ *, */)]
        return this.modifiers.modifyResistances(splits).join(', ')
    }

    public get advantages(): Partial<Record<AdvantageBinding, string>> {
        let map: Partial<Record<AdvantageBinding, string>> = {}
        let advantages = this.metadata.advantages ?? {};
        for (const binding of Object.values(AdvantageBinding)) {
            let binds: string[] = []
            if (advantages[binding]) {
                binds.push(advantages[binding])
            }
            if (this.race?.advantages?.[binding]) {
                binds.push(this.race.advantages[binding])
            }
            if (binds.length > 0) {
                map[binding] = binds.join(', ')
            }
        }
        return this.modifiers.modifyAdvantages(this.metadata.advantages ?? {})
    }

    public get disadvantages(): Partial<Record<AdvantageBinding, string>> {
        let map: Partial<Record<AdvantageBinding, string>> = {}
        let disadvantages = this.metadata.disadvantages ?? {};
        for (const binding of Object.values(AdvantageBinding)) {
            let binds: string[] = []
            if (disadvantages[binding]) {
                binds.push(disadvantages[binding])
            }
            if (this.race?.disadvantages?.[binding]) {
                binds.push(this.race.disadvantages[binding])
            }
            if (binds.length > 0) {
                map[binding] = binds.join(', ')
            }
        }
        return this.modifiers.modifyDisadvantages(this.metadata.disadvantages ?? {})
    }

    public get vulnerabilities(): string {
        let splits = [...(this.metadata.vulnerabilities ?? "").split(/ *, */), ...(this.race?.vulnerabilities ?? "").split(/ *, */)]
        return this.modifiers.modifyVulnerabilities(splits).join(', ')
    }

    public get dmgImmunities(): string {
        let splits = [...(this.metadata.dmgImmunities ?? "").split(/ *, */), ...(this.race?.dmgImmunities ?? "").split(/ *, */)]
        return this.modifiers.modifyDMGImmunities(splits).join(', ')
    }

    public get conImmunities(): string {
        let splits = [...(this.metadata.conImmunities ?? "").split(/ *, */), ...(this.race?.conImmunities ?? "").split(/ *, */)]
        return this.modifiers.modifyCONImmunities(splits).join(', ')
    }

    public get speed(): Record<MovementType, number> {
        return Object.values(MovementType).reduce<Record<MovementType, number>>((prev, type) => (
            { ...prev, [type]: this.getSpeed(type) }
        ), {} as Record<MovementType, number>)
    }

    public get speedAsText(): string {
        let options = getOptionType("movement").options;
        let speed = this.speed
        return Object.keys(speed).reduce<string[]>((prev, type: MovementType) => (
            speed[type] > 0 ? [...prev, `${options[type]} ${speed[type]}ft`] : prev
        ), []).join(', ')
    }

    public getSpeed(type: MovementType) {
        return (this.metadata.speed?.[type] ?? this.race?.speed?.[type] ?? 0) + this.modifiers.getMovementBonus(type)
    }

    public get senses(): Record<Sense, number> {
        return Object.values(Sense).reduce<Record<Sense, number>>((prev, sense) => (
            { ...prev, [sense]: this.getSenseRange(sense) }
        ), {} as Record<Sense, number>)
    }

    public get sensesAsText(): string {
        let options = getOptionType("sense").options;
        let senses = this.senses
        return Object.keys(senses).reduce<string[]>((prev, sense: Sense) => (
            senses[sense] > 0 ? [...prev, `${options[sense]} ${senses[sense]}ft`] : prev
        ), []).join(', ')
    }

    public getSenseRange(sense: Sense) {
        return Math.max(this.modifiers.getSenseRange(sense), this.metadata.senses?.[sense] ?? 0, this.race?.senses?.[sense] ?? 0)
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

    // Passives

    public get passivePerception(): IOptionType<number> {
        return this.metadata.passivePerception ?? OptionTypeAuto
    }

    public get passivePerceptionValue(): number {
        let mod = 0;
        switch (this.passivePerception.type) {
            case CalculationMode.Override:
                return this.passivePerception.value
            case CalculationMode.Modify:
                mod = this.passivePerception.value
            default:
            case CalculationMode.Auto:
                let proficiency = getProficiencyLevelValue(this.proficienciesSkill.perception)
                return 10 + this.getAttributeModifier(Attribute.WIS) + proficiency * this.proficiencyValue + mod
        }
    }

    public get passiveInvestigation(): IOptionType<number> {
        return this.metadata.passiveInvestigation ?? OptionTypeAuto
    }

    public get passiveInvestigationValue(): number {
        let mod = 0;
        switch (this.passivePerception.type) {
            case CalculationMode.Override:
                return this.passivePerception.value
            case CalculationMode.Modify:
                mod = this.passivePerception.value
            default:
            case CalculationMode.Auto:
                let proficiency = getProficiencyLevelValue(this.proficienciesSkill.investigation)
                return 10 + this.getAttributeModifier(Attribute.INT) + proficiency * this.proficiencyValue + mod
        }
    }

    public get passiveInsight(): IOptionType<number> {
        return this.metadata.passiveInsight ?? OptionTypeAuto
    }

    public get passiveInsightValue(): number {
        let mod = 0;
        switch (this.passivePerception.type) {
            case CalculationMode.Override:
                return this.passivePerception.value
            case CalculationMode.Modify:
                mod = this.passivePerception.value
            default:
            case CalculationMode.Auto:
                let proficiency = getProficiencyLevelValue(this.proficienciesSkill.insight)
                return 10 + this.getAttributeModifier(Attribute.WIS) + proficiency * this.proficiencyValue + mod
        }
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
        return this.modifiers.modifyProficienciesLanguage([...(this.metadata.proficienciesLanguage ?? []), ...(this.race?.proficienciesLanguage ?? [])])
    }

    public get proficienciesLanguageText(): string {
        let language = getOptionType('language').options;
        return this.proficienciesLanguage.map((key) => language[key]).join(', ')
    }

    // Spells

    public get spellAttribute(): OptionalAttribute {
        return asEnum(this.modifiers.spellAttribute, OptionalAttribute) ?? this.metadata.spellAttribute ?? getOptionType("optionalAttr").default
    }

    public get casterLevel(): IOptionType<number> {
        return this.metadata.casterLevel ?? OptionTypeAuto
    }

    public get casterLevelValue(): number {
        switch (this.casterLevel.type) {
            case CalculationMode.Modify:
                return this.level + this.casterLevel.value
            case CalculationMode.Override:
                return this.casterLevel.value
            default:
            case CalculationMode.Auto:
                return this.level
        } 
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