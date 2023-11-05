import Logger from "utils/logger";
import { arrayUnique, asArray, asEnum, asNumber, isEnum } from "utils/helpers";
import { ActionType, AdvantageBinding, Alignment, ArmorType, Attribute, CreatureType, DiceType, Language, MovementType, OptionalAttribute, ProficiencyLevel, Sense, SizeType, Skill, Tool, WeaponType } from "types/database/dnd";
import { CalculationMode, IOptionType, OptionTypeAuto } from "types/database/editor";
import { ICreatureMetadata } from "types/database/files/creature";
import { ObjectIdText } from "types/database";
import { Open5eCreature, Open5eCreatureAction } from "types/open5eCompendium";

const hpSplitExpr = /([0-9]+)d([0-9]+)([\+\-][0-9]+)?/

class Open5eCreatureData implements ICreatureMetadata {
    private readonly data: Partial<Open5eCreature>

    constructor(data: Partial<Open5eCreature>) {
        this.data = data ?? {};
    }

    public get name(): string {
        try {
            return this.data.name ?? ""
        } catch (error : unknown) {
            Logger.throw("Open5eCreatureData.name", error)
            return ""
        }
    }

    public get description(): string {
        try {
            return this.data.desc ?? ""
        } catch (error : unknown) {
            Logger.throw("Open5eCreatureData.description", error)
            return ""
        }
    }

    public get type(): CreatureType {
        try {
            return asEnum(this.data.type.toLowerCase(), CreatureType) ?? CreatureType.None
        } catch (error : unknown) {
            Logger.throw("Open5eCreatureData.type", error)
            return CreatureType.None
        }
    }

    public get size(): SizeType {
        try {
            return asEnum(this.data.size.toLowerCase(), SizeType) ?? SizeType.Medium
        } catch (error : unknown) {
            Logger.throw("Open5eCreatureData.size", error)
            return SizeType.Medium
        }
    }

    public get alignment(): Alignment {
        try {
            let alignment = this.data.alignment?.toLowerCase() ?? ""
            switch (true) {
                case /unaligned/.test(alignment): return Alignment.Unaligned
                case /any/.test(alignment): return Alignment.Any
                case /chaotic evil/.test(alignment): return Alignment.ChaoticEvil
                case /chaotic good/.test(alignment): return Alignment.ChaoticGood
                case /non\-lawful/.test(alignment):
                case /chaotic neutral/.test(alignment): return Alignment.ChaoticNeutral
                case /lawful evil/.test(alignment): return Alignment.LawfulEvil
                case /lawful good/.test(alignment): return Alignment.LawfulGood
                case /non\-chaotic/.test(alignment):
                case /lawful neutral/.test(alignment): return Alignment.LawfulNeutral
                case /non\-good/.test(alignment):
                case /neutral evil/.test(alignment): return Alignment.NeutralEvil
                case /non\-evil/.test(alignment):
                case /neutral good/.test(alignment): return Alignment.NeutralGood
                case /true neutral/.test(alignment):
                case /neutral/.test(alignment): return Alignment.TrueNeutral
                default: return Alignment.None
            }
        } catch (error : unknown) {
            Logger.throw("Open5eCreatureData.alignment", error)
            return Alignment.None
        }
    }

    public get portrait(): string {
        try {
            return this.data.img_main ?? null
        } catch (error : unknown) {
            Logger.throw("Open5eCreatureData.portrait", error)
            return null
        }
    }

    public get abilities(): ObjectIdText[] {
        try {
            return [
                ...this.data.actions, 
                ...asArray<Open5eCreatureAction>(this.data.special_abilities),
                ...asArray<Open5eCreatureAction>(this.data.legendary_actions)
                    .map(val => ({ ...val, name: `${ActionType.Legendary}: ${val.name}` })),
                ...asArray<Open5eCreatureAction>(this.data.reactions)
                    .map(val => ({ ...val, name: `${ActionType.Reaction}: ${val.name}` }))
            ].map((x) => `${x.name}. ${x.desc}`)
        } catch (error : unknown) {
            Logger.throw("Open5eCreatureData.abilities", error)
            return []
        }
    }

    public get challenge(): number {
        try {
            return this.data.cr ?? 0
        } catch (error : unknown) {
            Logger.throw("Open5eCreatureData.challenge", error)
            return 0
        }
    }

    public get xp(): number {
        return 0
    }

    public get level(): number {
        try {
            let res = hpSplitExpr.exec(this.data.hit_dice ?? "") ?? []
            return asNumber(res[1])
        } catch (error : unknown) {
            Logger.throw("Open5eCreatureData.level", error)
            return 0
        }
    }

    public get hitDice(): DiceType {
        try {
            let res = hpSplitExpr.exec(this.data.hit_dice ?? "") ?? []
            let dice = asNumber(res[2])
            return asEnum(dice, DiceType) ?? DiceType.None
        } catch (error : unknown) {
            Logger.throw("Open5eCreatureData.hitDice", error)
            return DiceType.None
        }
    }

    public get health(): IOptionType<number> {
        try {
            if (Number.isNaN(this.data.hit_points)) {
                return OptionTypeAuto
            } else {
                return { type: CalculationMode.Auto, value: this.data.hit_points }
            }
        } catch (error : unknown) {
            Logger.throw("Open5eCreatureData.health", error)
            return OptionTypeAuto
        }
    }

    public get ac(): IOptionType<number> {
        try {
            if (Number.isNaN(this.data.armor_class)) {
                return OptionTypeAuto
            } else {
                return { type: CalculationMode.Override, value: this.data.armor_class }
            }
        } catch (error : unknown) {
            Logger.throw("Open5eCreatureData.ac", error)
            return OptionTypeAuto
        }
    }

    public get proficiency(): IOptionType<number> {
        return OptionTypeAuto
    }

    public get initiative(): IOptionType<number> {
        return OptionTypeAuto
    }

    public get resistances(): string {
        try {
            return this.data.damage_resistances ?? ""
        } catch (error : unknown) {
            Logger.throw("Open5eCreatureData.resistances", error)
            return ""
        }
    }

    public get vulnerabilities(): string {
        try {
            return this.data.damage_vulnerabilities ?? ""
        } catch (error : unknown) {
            Logger.throw("Open5eCreatureData.vulnerabilities", error)
            return ""
        }
    }

    public get dmgImmunities(): string {
        try {
            return this.data.damage_immunities ?? ""
        } catch (error : unknown) {
            Logger.throw("Open5eCreatureData.dmgImmunities", error)
            return ""
        }
    }

    public get conImmunities(): string {
        try {
            return this.data.condition_immunities ?? ""
        } catch (error : unknown) {
            Logger.throw("Open5eCreatureData.conImmunities", error)
            return ""
        }
    }
    
    public get advantages(): Partial<Record<AdvantageBinding, string>> {
        return {}
    }
    
    public get disadvantages(): Partial<Record<AdvantageBinding, string>> {
        return {}
    }

    public get speed(): Partial<Record<MovementType, number>> {
        try {
            let speedData = this.data.speed ?? {}
            return Object.keys(speedData).reduce((prev, val) => 
                isEnum(val, MovementType)
                    ? { ...prev, [val]: speedData[val] } 
                    : { ...prev }
            , {})
        } catch (error : unknown) {
            Logger.throw("Open5eCreatureData.speed", error)
            return {}
        }
    }

    public get senses(): Partial<Record<Sense, number>> {
        try {
            let senseData = this.data.senses ?? ""
            let res: Partial<Record<Sense, number>> = {}
            let parts = senseData.toLowerCase().split(/\.\,?/g)
            for (const part of parts) {
                let match = /([a-z]+) +([0-9]+)/.exec(part)
                if (match?.[0]) {
                    let num = parseInt(match[2])
                    Logger.log("Open5eCreatureData.senses", match)
                    switch (match[1]) {
                        case "blindsight":
                            res[Sense.BlindSight] = isNaN(num) ? num : 0
                            break;
                        case "darkvission":
                            res[Sense.DarkVision] = isNaN(num) ? num : 0
                            break;
                        case "tremorsense":
                            res[Sense.TremorSense] = isNaN(num) ? num : 0
                            break;
                        case "truesight":
                            res[Sense.TrueSight] = isNaN(num) ? num : 0
                            break;
                        default:
                            break;
                    }
                }
            }
            return res
        } catch (error : unknown) {
            Logger.throw("Open5eCreatureData.senses", error)
            return {}
        }
    }

    public get proficienciesSave(): Attribute[] {
        try {
            let saves: Attribute[] = []
            if (this.data.strength_save !== null) {
                saves.push(Attribute.STR)
            }
            if (this.data.charisma_save !== null) {
                saves.push(Attribute.CHA)
            }
            if (this.data.constitution_save !== null) {
                saves.push(Attribute.CON)
            }
            if (this.data.dexterity_save !== null) {
                saves.push(Attribute.DEX)
            }
            if (this.data.intelligence_save !== null) {
                saves.push(Attribute.INT)
            }
            if (this.data.wisdom_save !== null) {
                saves.push(Attribute.WIS)
            }
            return saves
        } catch (error : unknown) {
            Logger.throw("Open5eCreatureData.proficienciesSave", error)
            return []
        }
    }

    public get proficienciesSkill(): Partial<Record<Skill, ProficiencyLevel>> {
        try {
            let skills = this.data.skills ?? {}
            let res: Partial<Record<Skill, ProficiencyLevel>> = {}
            for (const key of Object.keys(skills)) {
                if (skills[key] ?? null === null) return;
                switch (key.toLowerCase()) {
                case "acrobatics": // TODO: Verify
                    res[Skill.Acrobatics] = ProficiencyLevel.Proficient
                    break
                case "animal_handling": // TODO: Verify
                    res[Skill.AnimalHandling] = ProficiencyLevel.Proficient
                    break
                case "arcana": // TODO: Verify
                    res[Skill.Arcana] = ProficiencyLevel.Proficient
                    break
                case "athletics": // TODO: Verify
                    res[Skill.Athletics] = ProficiencyLevel.Proficient
                    break
                case "deception": // TODO: Verify
                    res[Skill.Deception] = ProficiencyLevel.Proficient
                    break
                case "history":
                    res[Skill.History] = ProficiencyLevel.Proficient
                    break
                case "insight": // TODO: Verify
                    res[Skill.Insight] = ProficiencyLevel.Proficient
                    break
                case "intimidation": // TODO: Verify
                    res[Skill.Intimidation] = ProficiencyLevel.Proficient
                    break
                case "investigation": // TODO: Verify
                    res[Skill.Investigation] = ProficiencyLevel.Proficient
                    break
                case "medicine": // TODO: Verify
                    res[Skill.Medicine] = ProficiencyLevel.Proficient
                    break
                case "nature": // TODO: Verify
                    res[Skill.Nature] = ProficiencyLevel.Proficient
                    break
                case "perception":
                    res[Skill.Perception] = ProficiencyLevel.Proficient
                    break
                case "performance": // TODO: Verify
                    res[Skill.Performance] = ProficiencyLevel.Proficient
                    break
                case "persuasion": // TODO: Verify
                    res[Skill.Persuasion] = ProficiencyLevel.Proficient
                    break
                case "religion": // TODO: Verify
                    res[Skill.Religion] = ProficiencyLevel.Proficient
                    break
                case "sleightOfHand": // TODO: Verify
                    res[Skill.SleightOfHand] = ProficiencyLevel.Proficient
                    break
                case "stealth":
                    res[Skill.Stealth] = ProficiencyLevel.Proficient
                    break
                case "survival": // TODO: Verify
                    res[Skill.Survival] = ProficiencyLevel.Proficient
                    break
                default:
                    break
                }
            }
            return res
        } catch (error : unknown) {
            Logger.throw("Open5eCreatureData.proficienciesSkill", error)
            return {}
        }
    }

    public get proficienciesArmor(): ArmorType[] {
        return []
    }

    public get proficienciesWeapon(): WeaponType[] {
        return []
    }

    public get proficienciesTool(): Partial<Record<Tool, ProficiencyLevel>> {
        return {}
    }

    public get proficienciesLanguage(): Language[] {
        try {
            let languages = this.data.languages ?? ""
            let res = languages.toLowerCase().split(/, */g)
            return arrayUnique(res?.reduce((prev, lang) => {
                switch (true) {
                    case isEnum(lang, Language):
                        return [...prev, lang]
                    default:
                        Logger.warn("Open5eCreatureData.proficienciesLanguage", `Unknown Language: '${lang}'`)
                        return prev
                }
            }, []) ?? [])
        } catch (error : unknown) {
            Logger.throw("Open5eCreatureData.proficienciesLanguage", error)
            return []
        }
    }

    public get spellAttribute(): OptionalAttribute {
        try {
            if ((this.data.spell_list?.length ?? 0) <= 0) {
                return OptionalAttribute.None
            }
            let maxValue = -99;
            let res = OptionalAttribute.None;
            const spellAttributes = [
                OptionalAttribute.INT,
                OptionalAttribute.WIS,
                OptionalAttribute.CHA
            ]
            for (const attr of spellAttributes) {
                let value = this[attr]
                if (value > maxValue) {
                    maxValue = value
                    res = attr
                }
            }
            return res
        } catch (error) {
            Logger.throw("Open5eCreatureData.spellAttribute", error)
            return OptionalAttribute.None
        }
    }

    public get spellSlots(): number[] {
        return []
    }

    public get casterLevel(): IOptionType<number> {
        return OptionTypeAuto
    }

    public get spells(): ObjectIdText[] {
        try {
            return this.data.spell_list ?? []
        } catch (error: unknown) {
            Logger.throw("Open5eCreatureData.spells", error)
            return []
        }
    }

    public get str(): number {
        try {
            return this.data.strength ?? 0
        } catch (error: unknown) {
            Logger.throw("Open5eCreatureData.str", error)
            return 10
        }
    }

    public get dex(): number {
        try {
            return this.data.dexterity ?? 0
        } catch (error: unknown) {
            Logger.throw("Open5eCreatureData.dex", error)
            return 10
        }
    }

    public get con(): number {
        try {
            return this.data.constitution ?? 0
        } catch (error: unknown) {
            Logger.throw("Open5eCreatureData.con", error)
            return 10
        }
    }

    public get int(): number {
        try {
            return this.data.intelligence ?? 0
        } catch (error: unknown) {
            Logger.throw("Open5eCreatureData.int", error)
            return 10
        }
    }

    public get wis(): number {
        try {
            return this.data.wisdom ?? 0
        } catch (error: unknown) {
            Logger.throw("Open5eCreatureData.wis", error)
            return 10
        }
    }

    public get cha(): number {
        try {
            return this.data.charisma ?? 0
        } catch (error: unknown) {
            Logger.throw("Open5eCreatureData.cha", error)
            return 10
        }
    }

    public get multiAttack(): number {
        return 1
    }

    public get bonusDamage(): number {
        return 0
    }

    public get critRange(): number {
        return 20
    }

    public toJSON(): ICreatureMetadata {
        return {
            name: this.name,
            description: this.description,
            type: this.type,
            size: this.size,
            alignment: this.alignment,
            portrait: this.portrait,
            abilities: this.abilities,
            challenge: this.challenge,
            level: this.level,
            hitDice: this.hitDice,
            health: this.health,
            ac: this.ac,
            proficiency: this.proficiency,
            initiative: this.initiative,
            resistances: this.resistances,
            vulnerabilities: this.vulnerabilities,
            dmgImmunities: this.dmgImmunities,
            conImmunities: this.conImmunities,
            advantages: this.advantages,
            disadvantages: this.disadvantages,
            senses: this.senses,
            speed: this.speed,
            proficienciesSave: this.proficienciesSave,
            proficienciesSkill: this.proficienciesSkill,
            proficienciesLanguage: this.proficienciesLanguage,
            str: this.str,
            dex: this.dex,
            con: this.con,
            int: this.int,
            wis: this.wis,
            cha: this.cha,
            spellAttribute: this.spellAttribute,
            spells: this.spells,
        }
    }
}

export default Open5eCreatureData