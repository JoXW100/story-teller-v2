import Logger from "utils/logger";
import { asEnum, asNumber, isEnum } from "utils/helpers";
import { AdvantageBinding, Alignment, AreaType, Attribute, CastingTime, CreatureType, DamageType, DiceType, Duration, EffectCondition, MagicSchool, MovementType, ScalingType, SizeType, TargetType } from "types/database/dnd"
import { CalculationMode, IOptionType, OptionTypeAuto } from "types/database/editor"
import { FileType, IFileMetadata } from "types/database/files";
import { ICreatureMetadata } from "types/database/files/creature";
import { ISpellMetadata } from "types/database/files/spell";
import { KeysOf } from "types";

const hpSplitExpr = /([0-9]+) *\(([0-9]+)d([0-9]+)([\+\-][0-9]+)?\)/
const areaMatchExpr = /([0-9]+)[- ]*(?:foot|feet)[- ]*([A-z]+)[- ]*(sphere|centered|cylinder)?/g
const saveMatchExpr = /([A-z-]+) *saving throw/
const durationMatchExpr = /([0-9]+)? *([A-z]+)/g
const challengeMatchExpr = /([0-9]+)(?:\/([0-9]+))?/
const speedMatchExpr = /(?:([A-z]+) *)?([0-9]+)/g
const castTimeExpr = /([0-9]+)? *([A-z-]+)/
const damageMatchExpr = /([0-9]+)d([0-9]+)[ -]+([A-z]+) *damage/
const damageExcMatchExpr = /([0-9]+)d([0-9]+)/

const getCastingTime = (time: string): { time: CastingTime, timeCustom: string, timeValue: number } => {
    var res = castTimeExpr.exec(time) ?? []
    var type = asEnum(res[2], CastingTime) ?? CastingTime.Custom 
    return {
        time: type,
        timeCustom: time,
        timeValue: asNumber(res[1], 1)
    }
}

const getDuration = (duration: string): { duration: Duration, durationValue: number } => {
    let expr = new RegExp(durationMatchExpr)
    let value: number = 0
    let type: Duration = Duration.Custom
    let hit: RegExpExecArray = null;

    while(null != (hit = expr.exec(duration?.toLowerCase() ?? ""))){
        if (type == Duration.Custom) {
            value = asNumber(hit[1], value)
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

const getCondition = (results: {[key: string]: string}): { cond: EffectCondition, attr?: Attribute } => {
    if (results['spell attack']) {
        return { cond: EffectCondition.Hit }
    }
    if (results['save']) {
        return { 
            cond: EffectCondition.Save, 
            attr: asEnum(results['save']?.substring(0, 3), Attribute)
        }
    }

    let res = saveMatchExpr.exec(results['content']?.toLowerCase() ?? "") ?? []
    if (res[1]) {
        return {
            cond: EffectCondition.Save,
            attr: asEnum(res[1].slice(0, 3), Attribute)
        }
    }
    return{ cond: EffectCondition.None }
}

const getTarget = (target: string) : TargetType => {
    var t = target?.toLowerCase()
    if (!t) 
        return TargetType.None
    if (t.includes("one creature") || t.includes("one character") || t.includes('touch'))
        return TargetType.Single
    if (t.includes("targets"))
        return TargetType.Multiple
    if (t.includes("self"))
        return TargetType.Self
    if (/(point|cube|sphere|square|line|cylinder|cone)/.test(t ?? ""))
        return TargetType.Point
    return TargetType.None
}

const getRange = (range: string): { range: number, area?: AreaType, areaSize?: number } => {
    if (range.includes('touch'))
        return { range: 5 }
    // Rare, perhaps remove
    var res = /[A-z-]+ *\( *([0-9]+)[^ ]+ ([A-z]+) *\)/.exec(range) ?? []
    if (res[2]) {
        var r = asNumber(res[1])
        return {
            range: asNumber(res[1]),
            area: asEnum(res[2], AreaType) ?? AreaType.None,
            areaSize: r
        }
    }
        
    var res = /([0-9]+)/.exec(range) ?? []
    return {
        range: asNumber(res[1]),
        area: AreaType.None,
        areaSize: 0
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
                size = asNumber(hit[1], size)
                break;
            case "square":
                area = AreaType.Square
                size = asNumber(hit[1], size)
                break;
            case "cube":
                area = AreaType.Cube
                size = asNumber(hit[1], size)
                break;
            case "cone":
                area = AreaType.Cone
                size = asNumber(hit[1], size)
                break;
            case "long":
                if (area == AreaType.None)
                    area = AreaType.Line
                size = asNumber(hit[1], size)
            case "wide":
                if (area == AreaType.None)
                    area = AreaType.Line
                height = asNumber(hit[1], height)
            case "tall":
                if (area == AreaType.None)
                    area = AreaType.Cylinder
                height = asNumber(hit[1], height)
            default:
                break;
        }
        if (size && height && area !== AreaType.None)
            break
    }

    return { area: area, areaSize: size, areaHeight: height }
}

const getDamage = (results: Record<string, string>): { damageType?: DamageType, effectModifier?: IOptionType<number>, effectDice?: DiceType, effectDiceNum?: number } => {
    let effectDiceNum: number = 1
    let effectDice: number = 0
    let damageType: string = DamageType.None

    if (results['damage']) {
        let res = damageExcMatchExpr.exec(results['damage']) ?? [] // Todo expand
        effectDiceNum = asNumber(res[1], effectDiceNum)
        effectDice = asNumber(res[2], effectDice)
        damageType = results['damage type']
    } else {
        let res = damageMatchExpr.exec(results['content']?.toLocaleLowerCase() ?? '') ?? []
        effectDiceNum = asNumber(res[1], effectDiceNum)
        effectDice = asNumber(res[2], effectDice)
        damageType = res[3]
    }
    
    return {
        effectDiceNum: effectDiceNum,
        effectDice: asEnum(effectDice, DiceType) ?? DiceType.None,
        damageType: asEnum(damageType, DamageType) ?? DamageType.None,
    }
}   

const getAlignment = (alignment: string) => {
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

const splitHP = (hp: string) => {
    var res = hpSplitExpr.exec(hp ?? "") ?? []
    return {
        hp: asNumber(res[1]),
        num: asNumber(res[2]),
        dice: asNumber(res[3]),
        mod: asNumber(res[4])
    }
}

const getChallenge = (challenge: string) => {
    var res = challengeMatchExpr.exec(challenge ?? "") ?? []
    var dividend = asNumber(res[1])
    var divisor = asNumber(res[2])
    return divisor !== 0 ? dividend / divisor : dividend
}

const getSpeed = (speed: string) => {
    var result = {}
    var expr = new RegExp(speedMatchExpr)
    var hit: RegExpExecArray = null;
    while(null != (hit = expr.exec(speed))){
        var key = hit[1] ?? MovementType.Walk
        if (isEnum(key, MovementType)) {
            result[key] = asNumber(hit[2])
        }
    }
    return result
}

const identifierExpr = /<a href="\/compendium\/dnd5e\/[^%<]+%[^"]+">([A-z]+)<\/a>/
const linkContentExpr = /<a[^>]*>[ \n\t]*([A-z0-9-() ]+)?[ \n\t]*<\/?a>/g
const roll20Expr = /<div *(?:class="([^"]*)")?[^>]*>\n?([^\n\t<>][^<>]*)/g
const roll20ContentExpr = /<div *id="pagecontent"[^>]+>[ \t\n]+([\S\s]+?)<\/div>/m
const roll20NameExpr = /<h1 *class="page-title" *>[ \n\t]*([A-z0-9 \-()]+)/

const roll20Importer = async (url: string): Promise<{ type: FileType, metadata: IFileMetadata }> => {
    if (!url.includes("roll20.net/compendium/dnd5e"))
        return null

    try {
        var res = await fetch(url, { method: 'GET' })
        var text = await res.text()
        var id = (identifierExpr.exec(text) ?? [])[1]?.toLocaleLowerCase()
        // Trim text
        var results = {}
        var start = text.search(/<div *class="content-text" [^>]*>/)
        text = text.slice(start)
        var end = text.search(/<script *type="text\/javascript" *>/)
        text = text.slice(0, end).trim()
        var tileRes = roll20NameExpr.exec(text) ?? []
        results['title'] = tileRes[1]
        var contentRes = roll20ContentExpr.exec(text) ?? []

        // Replace links
        results['content'] = contentRes[1]?.replace(/<br> *<br>/g, '\n')
            .replace(linkContentExpr, (...x) => x[1] ?? '').trim()
            .replace(/[\n\r]/g, '\n\\n\n')
        if (results['content']?.startsWith('<')) {
            results['content'] = ''
            Logger.warn("roll20Importer", "Failed to import description");
        }
            

        var expr = new RegExp(roll20Expr)
        var hit: RegExpExecArray = null;
        var key = null
        while(null != (hit = expr.exec(text))){
            if (hit[1] == "value") {
                results[key] = hit[2].toLowerCase()
            } else {
                key = hit[2]?.toLowerCase()
            }
        }
        switch (id) {
            case "spells":
                return { type: FileType.Spell, metadata: toSpell(results) }
            case "monsters":
                return { type: FileType.Creature, metadata: toCreature(results) }
            default:
                return null
        }
    } catch (error) {
        Logger.throw("roll20Importer", error)
        return null
    }
}

const toCreature = (results: {[key: string]: string}): ICreatureMetadata => {
    var ac = Number(results['ac'] ? (/(-?[0-9]+)/.exec(results['ac']) ?? [])[1] : undefined)
    var { hp, num, dice } = splitHP(results['hp'])
    var passive = `passive perception ${results['passive perception'] ?? "10"}`
    // var senses = results['senses'] ? [passive , results['senses']] : [passive]
    var fileContent = {
        name: results['title'] ?? "Missing name",
        description: results['content'] ?? "",
        type: asEnum(results['type'], CreatureType) ?? CreatureType.None,
        size: asEnum(results['size'], SizeType) ?? SizeType.Medium,
        alignment: getAlignment(results['alignment']),
        level: num ? num : 1,
        hitDice: asEnum(dice, DiceType) ?? DiceType.None,
        health: hp 
            ? { type: CalculationMode.Auto, value: hp } 
            : OptionTypeAuto,
        ac: isNaN(ac) 
            ? OptionTypeAuto
            : { type: CalculationMode.Auto, value: ac } ,
        resistances: results['resistances'] ?? "",
        advantages: results['advantages'] ? { [AdvantageBinding.General]: results['advantages'] } : {}, // @todo confirm 
        dmgImmunities: results['immunities'] ?? "",
        conImmunities: results['condition immunities'] ?? "",
        speed: getSpeed(results['speed']),
        str: asNumber(results['str'], 10),
        dex: asNumber(results['dex'], 10),
        con: asNumber(results['con'], 10),
        int: asNumber(results['int'], 10),
        wis: asNumber(results['wis'], 10),
        cha: asNumber(results['cha'], 10),
        // languages: results['languages'] ?? "",
        // senses: senses.join(', '),
        challenge: getChallenge(results['challenge rating'])
    } satisfies ICreatureMetadata

    return fileContent
}

const toSpell = (results: {[key: string]: string}): ISpellMetadata => {
    var { time, timeCustom, timeValue } = getCastingTime(results['casting time'])
    var { duration, durationValue } = getDuration(results['duration'])
    var { damageType, effectDice, effectDiceNum } = getDamage(results)
    var { range, area, areaSize } = getRange(results['range'])
    var { cond, attr } = getCondition(results)
    if (area === AreaType.None) {
        var { area, areaSize, areaHeight } = getArea(results['content'] ?? "")
    }

    var fileContent: ISpellMetadata = {
        name: results['title'] ?? "Missing name",
        description: results['content'] ?? "",
        level: asNumber(results['level']),
        school: asEnum(results['school'], MagicSchool) ?? MagicSchool.Abjuration,
        time: time,
        timeCustom: timeCustom,
        timeValue: timeValue,
        duration: duration,
        durationValue: durationValue,
        ritual: results['ritual'] == "yes",
        concentration: results['concentration'] == "yes",
        componentMaterial: Boolean(results['components']?.includes('m')),
        materials: results['material'] ?? "",
        componentSomatic: Boolean(results['components']?.includes('s')),
        componentVerbal: Boolean(results['components']?.includes('v')),
        condition: cond,
        saveAttr: attr,
        target: getTarget(results['target']),
        range: range,
        area: area,
        areaSize: areaSize,
        areaHeight: areaHeight,
        conditionScaling: ScalingType.SpellModifier,
        conditionProficiency: true,
        effects: [
            {
                id: "main",
                label: damageType === DamageType.None ? "Effect" : damageType,
                text: damageType === DamageType.None ? results["title"] : "",
                damageType: damageType,
                dice: effectDice,
                diceNum: effectDiceNum
            }
        ]
    } satisfies KeysOf<ISpellMetadata>
    
    Logger.log("toSpell", { file: fileContent, result: results })
    return fileContent
}

export default roll20Importer