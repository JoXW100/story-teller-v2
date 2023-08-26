import Communication from "utils/communication"
import Logger from "utils/logger";
import { asEnum, isEnum } from "utils/helpers";
import { ActionType, Alignment, AreaType, Attribute, CastingTime, CreatureType, DamageType, DiceType, Duration, EffectCondition, MagicSchool, MovementType, OptionalAttribute, ScalingType, Sense, SizeType, Skill, TargetType } from "types/database/dnd";
import { CalculationMode, OptionType } from "types/database/editor";
import { ICreatureMetadata } from "types/database/files/creature";
import { ISpellMetadata } from "types/database/files/spell";
import { KeysOf } from "types";

const hpSplitExpr = /([0-9]+)d([0-9]+)([\+\-][0-9]+)?/
const castTimeExpr = /([0-9]+)? *([A-z-]+)/
const durationMatchExpr = /([0-9]+)? *([A-z]+)/g
const areaMatchExpr = /([0-9]+)[- ]*(?:foot|feet)[- ]*([A-z]+)[- ]*(sphere|centered|cylinder)?/g
const damageMatchExpr = /([0-9]+)d([0-9]+)[ -]+([A-z]+) *damage/
const conditionMatchExpr = /(?:([A-z]+) (saving[- ]*throw)|(ranged|melee) (spell[- ]*attack))/

interface Open5eMonsterAction {
    name: string
    desc: string
    attack_bonus?: number
    damage_dice?: string
}

interface Open5eMonster {
    slug: string // id
    desc: string
    // Stats
    charisma: number
    constitution: number
    dexterity: number
    intelligence: number
    strength: number
    wisdom: number
    // Info
    hit_dice: string
    hit_points: number
    img_main: null
    languages: string
    name: string
    alignment: string
    armor_class: number
    armor_desc: string
    cr: number
    challenge_rating: string
    type: string
    sub_type: string
    senses: string
    size: string
    speed: Record<string, number>
    // Saves
    charisma_save: number | null
    constitution_save: number | null
    dexterity_save: number | null
    intelligence_save: number | null
    strength_save: number | null
    wisdom_save: number | null
    // Immunities & Resistances
    condition_immunities: string
    damage_immunities: string
    damage_resistances: string
    damage_vulnerabilities: string
    // Actions
    actions: Open5eMonsterAction[]
    legendary_actions: Open5eMonsterAction[] | string
    legendary_desc: string
    reactions: Open5eMonsterAction[] | string
    special_abilities: Open5eMonsterAction[] | string
    // Skills
    perception: number
    skills: Record<string, number>
    // Ignore
    document__license_url: string
    document__slug: string
    document__title: string
    group: null

    spell_list: string[] // open5e urls to the spell pages
}

interface Open5eSpell {
    archetype: string
    casting_time: string
    circles: string
    components: string
    concentration: string
    desc: string
    dnd_class: string
    duration: string
    higher_level: string
    level: string
    level_int: number
    material: string
    name: string
    page: string
    range: string
    ritual: string
    school: string
    slug: string
    // Ignore
    document__license_url: string
    document__slug: string
    document__title: string
}

const splitHP = (hp: string) => {
    let res = hpSplitExpr.exec(hp ?? "") ?? []
    return {
        num: isNaN(Number(res[1])) ? 0 : Number(res[1]),
        dice: isNaN(Number(res[2])) ? 0 : Number(res[2]),
        mod: isNaN(Number(res[3])) ? 0 : Number(res[3])
    }
}

const getAlignment = (alignment: string): Alignment => {
    switch (true) {
        case /unaligned/.test(alignment):
            return Alignment.Unaligned

        case /any/.test(alignment):
            return Alignment.Any
            
        case /chaotic evil/.test(alignment):
            return Alignment.ChaoticEvil

        case /chaotic good/.test(alignment):
            return Alignment.ChaoticGood

        case /non\-lawful/.test(alignment):
        case /chaotic neutral/.test(alignment):
            return Alignment.ChaoticNeutral

        case /lawful evil/.test(alignment):
            return Alignment.LawfulEvil

        case /lawful good/.test(alignment):
            return Alignment.LawfulGood
            
        case /non\-chaotic/.test(alignment):
        case /lawful neutral/.test(alignment):
            return Alignment.LawfulNeutral

        case /non\-good/.test(alignment):
        case /neutral evil/.test(alignment):
            return Alignment.NeutralEvil

        case /non\-evil/.test(alignment):
        case /neutral good/.test(alignment):
            return Alignment.NeutralGood

        case /true neutral/.test(alignment):
        case /neutral/.test(alignment):
            return Alignment.TrueNeutral
            
        default:
            return Alignment.None
    }
}

const getSpeed = (speed: Record<string, number>): Partial<Record<MovementType, number>> => {
    return Object.keys(speed).reduce((prev, val) => 
        isEnum(val, MovementType)
            ? { ...prev, [val]: speed[val] } 
            : { ...prev }
    , {}) as Partial<Record<MovementType, number>>
}

const getSaveProficiencies = (monster: Open5eMonster): Attribute[] => {
    let saves: Attribute[] = []
    if (monster.strength_save !== null) {
        saves.push(Attribute.STR)
    }
    if (monster.charisma_save !== null) {
        saves.push(Attribute.CHA)
    }
    if (monster.constitution_save !== null) {
        saves.push(Attribute.CON)
    }
    if (monster.dexterity_save  !== null) {
        saves.push(Attribute.DEX)
    }
    if (monster.intelligence_save !== null) {
        saves.push(Attribute.INT)
    }
    if (monster.wisdom_save !== null) {
        saves.push(Attribute.WIS)
    }
    return saves
}

const getSkillProficiencies = (skills: Record<string, number>): Skill[] => {
    let res: Skill[] = []
    Object.keys(skills).forEach((key) => {
        if (skills[key] ?? null === null) return;
        switch (key.toLowerCase()) {
            case "acrobatics": // TODO: Verify
                res.push(Skill.Acrobatics)
                break
            case "animal_handling": // TODO: Verify
                res.push(Skill.AnimalHandling)
                break
            case "arcana": // TODO: Verify
                res.push(Skill.Arcana)
                break
            case "athletics": // TODO: Verify
                res.push(Skill.Athletics)
                break
            case "deception": // TODO: Verify
                res.push(Skill.Deception)
                break
            case "history":
                res.push(Skill.History)
                break
            case "insight": // TODO: Verify
                res.push(Skill.Insight)
                break
            case "intimidation": // TODO: Verify
                res.push(Skill.Intimidation)
                break
            case "investigation": // TODO: Verify
                res.push(Skill.Investigation)
                break
            case "medicine": // TODO: Verify
                res.push(Skill.Medicine)
                break
            case "nature": // TODO: Verify
                res.push(Skill.Nature)
                break
            case "perception":
                res.push(Skill.Perception)
                break
            case "performance": // TODO: Verify
                res.push(Skill.Performance)
                break
            case "persuasion": // TODO: Verify
                res.push(Skill.Persuasion)
                break
            case "religion": // TODO: Verify
                res.push(Skill.Religion)
                break
            case "sleightOfHand": // TODO: Verify
                res.push(Skill.SleightOfHand)
                break
            case "stealth":
                res.push(Skill.Stealth)
                break
            case "survival": // TODO: Verify
                res.push(Skill.Survival)
                break
            default:
                break
        }
    })
    return res
}

const getSenses = (senses: string): Partial<Record<Sense, number>> => {
    let res: Partial<Record<Sense, number>> = {}
    let parts = senses.toLowerCase().split(/\.\,?/g)
    parts.forEach(part => {
        let match = /([a-z]+) +([0-9]+)/.exec(part)
        if (match && match[0]) {
            let num = parseInt(match[2])
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
    });
    return res
}

const getCastingTime = (time: string): { time: CastingTime, timeCustom: string, timeValue: number } => {
    let res = castTimeExpr.exec(time.toLowerCase()) ?? []
    let type = asEnum(res[2], CastingTime) ?? CastingTime.Custom 
    return {
        time: type,
        timeCustom: time,
        timeValue: Number(res[1]) ? Number(res[1]) : 1
    }
}

const getDuration = (duration: string): { duration: Duration, durationValue: number } => {
    let expr = new RegExp(durationMatchExpr)
    let value: number = 0
    let type: Duration = Duration.Custom
    let hit: RegExpExecArray = null;

    while(null != (hit = expr.exec(duration?.toLowerCase() ?? ""))){
        if (type == Duration.Custom) {
            value = Number(hit[1]) ? Number(hit[1]) : value
        }
        switch (hit[2]) {
            case "instantaneous":
                type = Duration.Instantaneous
                break 
            case "round":
            case "rounds":
                type = Duration.Round
                break 
            case "minute":
            case "minutes":
                type = Duration.Minute
                break 
            case "hour":
            case "hours":
                type = Duration.Hour
                break 
            case "day":
            case "days":
                type = Duration.Day
                break 
            default:
                break
        }
    }

    return {
        duration: type,
        durationValue: value
    }
}

const getRange = (range: string): number => {
    if (range.includes('touch')) {
        return 5;
    }
        
    var res = /([0-9]+)/.exec(range) ?? []
    return isNaN(Number(res[1])) ? 0 : Number(res[1])
}

const getAttribute = (attribute: string): Attribute => {
    switch (attribute) {
        case "charisma":
        case "cha":
            return Attribute.CHA
        case "constitution":
        case "con":
            return Attribute.CON
        case "dexterity":
        case "dex":
            return Attribute.DEX
        case "intelligence":
        case "int":
            return Attribute.INT
        case "strength":
        case "str":
            return Attribute.STR
        case "wisdom":
        case "wis":
            return Attribute.WIS
        default:
            Logger.warn("getAttribute", "Missed attribute, ...defaulting")
            return Attribute.CHA
    }
}

const getCondition = (desc: string): { condition: EffectCondition, saveAttr?: Attribute } => {
    let res = conditionMatchExpr.exec(desc.toLowerCase())
    if (res) {
        switch (res[2]) {
            case "saving throw":
            case "saving-throw":
                return {
                    condition: EffectCondition.Save,
                    saveAttr: getAttribute(res[1])
                }
            case "spell attack":
            case "spell-attack":
                return { condition: EffectCondition.Hit }
            default:
                break;
        }
    } 
    return { condition: EffectCondition.None }
}

const getDamage = (desc: string): { damageType: DamageType, effectDice: DiceType, effectDiceNum: number  } => {
    let res = damageMatchExpr.exec(desc.toLowerCase())
    let effectDiceNum: number = 1
    let effectDice: DiceType = DiceType.None
    let damageType: DamageType = DamageType.None
    if (res) {
        effectDiceNum = isNaN(Number(res[1])) ? effectDiceNum : Number(res[1])
        effectDice = isNaN(Number(res[2])) ? effectDiceNum : Number(res[2]) as DiceType
        damageType = res[3] as DamageType
    }
    
    return {
        effectDiceNum: effectDiceNum,
        effectDice: asEnum(effectDice, DiceType) ?? DiceType.None,
        damageType: asEnum(damageType, DamageType) ?? DamageType.None,
    }
}

const getArea = (content: string): { area: AreaType, areaSize: number, areaHeight?: number } => {
    var expr = new RegExp(areaMatchExpr)
    var area: AreaType = AreaType.None
    var size: number = 0
    var height: number = 0
    var hit: RegExpExecArray = null;
    while(null != (hit = expr.exec(content?.toLowerCase() ?? ""))){
        switch (hit[3]) {
            case "centered":
            case "sphere":
                area = AreaType.Sphere
                break;
            case "cylinder":
                area = AreaType.Cylinder
                break;
            default:
                break;
        }
        switch (hit[2]) {
            case "radius":
                if (area == AreaType.None)
                    area = AreaType.Sphere
                size = Number(hit[1]) ? Number(hit[1]) : size
                break;
            case "square":
                area = AreaType.Square
                size = Number(hit[1]) ? Number(hit[1]) : size
                break;
            case "cube":
                area = AreaType.Cube
                size = Number(hit[1]) ? Number(hit[1]) : size
                break;
            case "cone":
                area = AreaType.Cone
                size = Number(hit[1]) ? Number(hit[1]) : size
                break;
            case "long":
                if (area == AreaType.None)
                    area = AreaType.Line
                size = Number(hit[1]) ? Number(hit[1]) : size
            case "wide":
                if (area == AreaType.None)
                    area = AreaType.Line
                height = Number(hit[1]) ? Number(hit[1]) : size
            case "tall":
                if (area == AreaType.None)
                    area = AreaType.Cylinder
                height = Number(hit[1]) ? Number(hit[1]) : size
            default:
                break;
        }
        if (size && height && area !== AreaType.None)
            break
    }

    return { area: area, areaSize: size, areaHeight: height }
}

const getTarget = (area: AreaType, range: string): TargetType => {
    switch (area) {
        case AreaType.Cone:
        case AreaType.Cube:
        case AreaType.Cylinder:
        case AreaType.Line:
        case AreaType.Sphere:
        case AreaType.Square:
            return TargetType.Point
        case AreaType.None:
            if (range.toLowerCase() == "touch") {
                return TargetType.Touch
            }
        default:
            return TargetType.Single
    }
}

const estimateSpellAttribute = (monster: Open5eMonster): OptionalAttribute => {
    if (monster.spell_list.length <= 0) {
        return OptionalAttribute.None
    }
    return [ 
        { val: monster.intelligence, attr: OptionalAttribute.INT },
        { val: monster.wisdom, attr: OptionalAttribute.WIS },
        { val: monster.charisma, attr: OptionalAttribute.CHA }
    ].reduce((prev, val) => (
        val.val > prev.val ? val : prev
    ), { val: -1, attr: OptionalAttribute.INT }).attr
}

export const open5eCreatureImporter = async (id: string): Promise<ICreatureMetadata> => {
    let res = await Communication.open5eFetchOne<Open5eMonster>("monsters", id);
    if (!res) { return null; }
    res.special_abilities = typeof res.special_abilities == typeof [] ? res.special_abilities : []
    res.legendary_actions = typeof res.legendary_actions == typeof [] ? res.legendary_actions : []
    res.reactions = typeof res.reactions == typeof [] ? res.reactions : []
    let { num, dice } = splitHP(res.hit_dice)
    let metadata = {
        name: res.name,
        type: asEnum(res.type.toLowerCase(), CreatureType) ?? CreatureType.None,
        size: asEnum(res.size.toLowerCase(), SizeType) ?? SizeType.Medium,
        alignment: getAlignment(res.alignment.toLowerCase()),
        portrait: res.img_main ?? null,
        description: res.desc,
        abilities: [
            ...res.actions, 
            ...res.special_abilities as Open5eMonsterAction[],
            ...(res.legendary_actions as Open5eMonsterAction[])?.map(val => ({ ...val, name: `${ActionType.Legendary}: ${val.name}` })),
            ...(res.reactions as Open5eMonsterAction[])?.map(val => ({ ...val, name: `${ActionType.Reaction}: ${val.name}` }))
        ].map((x) => `${x.name}. ${x.desc}`),
        challenge: res.cr,
        // xp: 

        level: num,
        hitDice: asEnum(dice, DiceType) ?? DiceType.None,
        health: { type: CalculationMode.Auto, value: res.hit_points } satisfies OptionType<number>,
        ac: { type: CalculationMode.Override, value: res.armor_class } satisfies OptionType<number>,
        proficiency: { type: CalculationMode.Auto, value: 0 } satisfies OptionType<number>,
        initiative: { type: CalculationMode.Auto, value: 0 } satisfies OptionType<number>,

        resistances: res.damage_resistances,
        vulnerabilities: res.damage_vulnerabilities,
        // advantages: 
        dmgImmunities: res.damage_immunities,
        conImmunities: res.condition_immunities,

        speed: getSpeed(res.speed),
        senses: getSenses(res.senses),

        proficienciesSave: getSaveProficiencies(res),
        proficienciesSkill: getSkillProficiencies(res.skills),
        // languages:

        str: res.strength,
        dex: res.dexterity,
        con: res.constitution,
        int: res.intelligence,
        wis: res.wisdom,
        cha: res.charisma,
        spellAttribute: estimateSpellAttribute(res),

        // spellSlots: 
        spells: res.spell_list ? res.spell_list : [],
    } satisfies ICreatureMetadata
    
    Logger.log("toCreature", { file: res, result: metadata })
    return metadata
}

export const open5eSpellImporter = async (id: string): Promise<ISpellMetadata> => {
    let res = await Communication.open5eFetchOne<Open5eSpell>("spells", id);
    if (!res) { return null; }
    let { time, timeCustom, timeValue } = getCastingTime(res.casting_time)
    let { duration, durationValue } = getDuration(res.duration)
    let { condition, saveAttr } = getCondition(res.desc)
    let { damageType, effectDice, effectDiceNum } = getDamage(res.desc)
    let { area, areaSize, areaHeight } = getArea(res.desc)
    let components = res.components.toLowerCase()
    let metadata: ISpellMetadata = {
        name: res.name,
        description: res.desc,
        level: res.level_int,
        school: asEnum(res.school.toLowerCase(), MagicSchool) ?? MagicSchool.Abjuration,
        time: time,
        timeCustom: timeCustom,
        timeValue: timeValue,
        duration: duration,
        durationValue: durationValue,
        ritual: res.ritual.toLowerCase() == "yes",
        concentration: res.concentration.toLowerCase() == "yes",
        componentMaterial: components.includes('m'),
        materials: res.material,
        componentSomatic: components.includes('s'),
        componentVerbal: components.includes('v'),
        condition: condition,
        saveAttr: saveAttr,
        target: getTarget(area, res.range), // TODO: Find in description
        range: getRange(res.range),
        area: area,
        areaSize: areaSize,
        areaHeight: areaHeight,
        conditionScaling: ScalingType.SpellModifier,
        conditionProficiency: true,
        effects: [
            {
                id: "main",
                label: damageType === DamageType.None ? "Effect" : damageType,
                damageType: damageType,
                dice: effectDice,
                diceNum: effectDiceNum
            }
        ]
    } satisfies KeysOf<ISpellMetadata>
    
    Logger.log("toSpell", { file: res, result: metadata })
    return metadata
}