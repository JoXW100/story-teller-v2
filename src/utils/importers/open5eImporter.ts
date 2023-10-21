import Communication from "utils/communication"
import Logger from "utils/logger";
import { asEnum } from "utils/helpers";
import { AreaType, Attribute, CastingTime, DamageType, DiceType, Duration, EffectCondition, MagicSchool, ScalingType, TargetType } from "types/database/dnd";
import { ICreatureMetadata } from "types/database/files/creature";
import { ISpellMetadata } from "types/database/files/spell";
import { KeysOf } from "types";
import { Open5eCreature } from "types/open5eCompendium";
import Open5eCreatureData from "data/structures/open5eCreature";

const castTimeExpr = /([0-9]+)? *([A-z-]+)/
const durationMatchExpr = /([0-9]+)? *([A-z]+)/g
const areaMatchExpr = /([0-9]+)[- ]*(?:foot|feet)[- ]*([A-z]+)[- ]*(sphere|centered|cylinder)?/g
const damageMatchExpr = /([0-9]+)d([0-9]+)[ -]+([A-z]+) *damage/
const conditionMatchExpr = /(?:([A-z]+) (saving[- ]*throw)|(ranged|melee) (spell[- ]*attack))/

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

export const open5eCreatureImporter = async (id: string): Promise<ICreatureMetadata> => {
    let res = await Communication.open5eFetchOne<Open5eCreature>("monsters", id);
    if (!res) { return null; }
    try {
        let metadata = new Open5eCreatureData(res)
        Logger.log("toCreature", { file: res, result: metadata })
        return metadata.toJSON()
    } catch (error: unknown) {
        Logger.throw("open5eCreatureImporter", error)
        return null;
    }
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