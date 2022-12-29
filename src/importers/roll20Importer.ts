import { Alignment, AreaType, Attribute, CastingTime, CreatureType, DamageType, DiceType, Duration, EffectCondition, MagicSchool, MovementType, ScalingType, SizeType, TargetType } from "types/database/dnd"
import { CalculationMode, OptionType } from "types/database/editor"
import { FileMetadata, FileType } from "types/database/files"
import { CreatureMetadata } from "types/database/files/creature"
import { SpellMetadata } from "types/database/files/spell"

const hpSplitExpr = /([0-9]+) *\(([0-9]+)d([0-9]+)([\+\-][0-9]+)?\)/
const areaMatchExpr = /([0-9]+)[- ]*(?:foot|feet)[- ]*([A-z]+)[- ]*(sphere|centered|cylinder)?/g
const saveMatchExpr = /([A-z-]+) *saving throw/
const durationMatchExpr = /([0-9]+)? *([A-z]+)/g
const challengeMatchExpr = /([0-9]+)(?:\/([0-9]+))?/
const speedMatchExpr = /(?:([A-z]+) *)?([0-9]+)/g

const getCastingTime = (time: string): { time: CastingTime, timeCustom: string, timeValue: number } => {
    var res = /([0-9]+)? *([A-z-]+)/.exec(time) ?? []
    var type = Object.values(CastingTime).includes(res[2] as CastingTime) 
        ? res[2] as CastingTime 
        : CastingTime.Custom 
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

const getCondition = (results: {[key: string]: string}): { cond: EffectCondition, attr?: Attribute } => {
    if (results['spell attack']) {
        return { cond: EffectCondition.Hit }
    }
    if (results['save']) {
        let attr: Attribute = results['save']?.substring(0, 3) as Attribute
        return { 
            cond: EffectCondition.Save, 
            attr: Object.values(Attribute).includes(attr) ? attr : undefined 
        }
    }

    let res = saveMatchExpr.exec(results['content']?.toLowerCase() ?? "") ?? []
    if (res[1]) {
        let attr: Attribute = res[1].slice(0, 3) as Attribute
        return {
            cond: EffectCondition.Save,
            attr: Object.values(Attribute).includes(attr) ? attr : undefined
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
        var area = res[2] as AreaType
        var r = Number(res[1]) ? Number(res[1]) : 0
        return {
            range: r,
            area: Object.values(AreaType).includes(area) ? area : AreaType.None,
            areaSize: r
        }
    }
        
    var res = /([0-9]+)/.exec(range) ?? []
    return {
        range: Number(res[1]) ? Number(res[1]) : 0,
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

const getDamage = (damage: string): { effectText?: string, effectModifier?: OptionType<number>, 
                                      effectDice?: DiceType, effectDiceNum?: number } => {
    var res = /([0-9]+)d([0-9]+)/.exec(damage) ?? [] // Todo expand
    return {
        effectDiceNum: Number(res[1]) ? Number(res[1]) : 1,
        effectDice: Number(res[2]) ? Number(res[2]) : DiceType.None
    }
}   

const getAlignment = (alignment: string) => {
    switch (true) {
        case /unaligned/.test(alignment):
            return Alignment.Unaligned
            
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
        hp: Number(res[1]) ? Number(res[1]) : 0,
        num: Number(res[2]) ? Number(res[2]) : 0,
        dice: Number(res[3]) ? Number(res[3]) : 0,
        mod: Number(res[4]) ? Number(res[4]) : 0
    }
}

const getChallenge = (challenge: string) => {
    var res = challengeMatchExpr.exec(challenge ?? "") ?? []
    var dividend = res[1] ?? 0
    var divisor = res[2]
    return divisor ? Number(dividend) / Number(divisor) : Number(dividend)
}

const getSpeed = (speed: string) => {
    var result = {}
    var expr = new RegExp(speedMatchExpr)
    var hit: RegExpExecArray = null;
    while(null != (hit = expr.exec(speed))){
        var key = hit[1] ?? MovementType.Walk
        if (Object.values(MovementType).includes(key as unknown as MovementType)) {
            result[key ?? MovementType.Walk] = Number(hit[2]) ? Number(hit[2]) : 0
        }
    }
    return result
}

const identifierExpr = /<a href="\/compendium\/dnd5e\/[^%<]+%[^"]+">([A-z]+)<\/a>/
const linkContentExpr = /<a[^>]*>[ \n\t]*([A-z0-9-() ]+)?[ \n\t]*<\/?a>/g
const roll20Expr = /<div *(?:class="([^"]*)")?[^>]*>\n?([^\n\t<>][^<>]*)/g
const roll20ContentExpr = /<div *id="pagecontent"[^>]+>[ \t\n]+([\S\s]+?)<\/div>/m
const roll20NameExpr = /<h1 *class="page-title" *>[ \n\t]*([A-z0-9 \-()]+)/

const roll20Importer = async (url: string): Promise<{ type: FileType, metadata: FileMetadata }> => {
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
            console.warn("Failed to import description")
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
        console.error(error)
        return null
    }
}

const toCreature = (results: {[key: string]: string}): CreatureMetadata => {
    var type = results['type'] as CreatureType
    var size = results['size'] as SizeType
    var ac = Number(results['ac'] ? (/(-?[0-9]+)/.exec(results['ac']) ?? [])[1] : undefined)
    var { hp, num, dice } = splitHP(results['hp'])
    var passive = `passive perception ${results['passive perception'] ?? "10"}`
    var senses = results['senses'] ? [passive , results['senses']] : [passive]
    var fileContent: CreatureMetadata = {
        name: results['title'] ?? "Missing name",
        description: results['content'] ?? "",
        type: Object.values(CreatureType).includes(type) ? type : CreatureType.None,
        size: Object.values(SizeType).includes(size) ? size : SizeType.Medium,
        alignment: getAlignment(results['alignment']),
        level: num ? num : 1,
        hitDice: Object.values(DiceType).includes(dice) ? dice : DiceType.None,
        health: hp 
            ? { type: CalculationMode.Override, value: hp } 
            : { type: CalculationMode.Auto } as OptionType<number>,
        ac: ac 
            ? { type: CalculationMode.Override, value: ac } 
            : { type: CalculationMode.Auto } as OptionType<number>,
        resistances: results['resistances'] ?? "",
        advantages: results['advantages'] ?? "", // @todo confirm 
        dmgImmunities: results['immunities'] ?? "",
        conImmunities: results['condition immunities'] ?? "",
        speed: getSpeed(results['speed']),
        str: Number(results['str']) ? Number(results['str']) : 0,
        dex: Number(results['dex']) ? Number(results['dex']) : 0,
        con: Number(results['con']) ? Number(results['con']) : 0,
        int: Number(results['int']) ? Number(results['int']) : 0,
        wis: Number(results['wis']) ? Number(results['wis']) : 0,
        cha: Number(results['cha']) ? Number(results['cha']) : 0,
        languages: results['languages'] ?? "",
        senses: senses.join(', '),
        challenge: getChallenge(results['challenge rating'])
    }

    return fileContent
}

const toSpell = (results: {[key: string]: string}): SpellMetadata => {
    var level = Number(results['level'])
    var school = results['school'] as MagicSchool
    var { time, timeCustom, timeValue } = getCastingTime(results['casting time'])
    var { duration, durationValue } = getDuration(results['duration'])
    var { effectDice, effectDiceNum } = getDamage(results['damage'])
    var { range, area, areaSize } = getRange(results['range'])
    var { cond, attr } = getCondition(results)
    if (area === AreaType.None) {
        var { area, areaSize, areaHeight } = getArea(results['content'] ?? "")
    }
    var damageType: DamageType = results['damage type'] as DamageType

    var fileContent: SpellMetadata = {
        name: results['title'] ?? "Missing name",
        description: results['content'] ?? "",
        level: level ? level : 0,
        school: Object.values(MagicSchool).includes(school) ? school : MagicSchool.Abjuration,
        time: time,
        timeCustom: timeCustom,
        timeValue: timeValue,
        duration: duration,
        durationValue: durationValue,
        ritual: results['ritual'] == "yes",
        concentration: results['concentration'] == "yes",
        componentMaterial: results['components']?.includes('m') || false,
        materials: results['material'] ?? "",
        componentSomatic: results['components']?.includes('s') || false ,
        componentVerbal: results['components']?.includes('v') || false,
        condition: cond,
        saveAttr: attr,
        damageType: Object.values(DamageType).includes(damageType) ? damageType : DamageType.None,
        target: getTarget(results['target']),
        range: range,
        area: area,
        areaSize: areaSize ?? 0,
        areaHeight: areaHeight ?? 0,
        conditionScaling: ScalingType.SpellModifier,
        conditionProficiency: true,
        effectDice: effectDice,
        effectDiceNum: effectDiceNum
    }

    if (fileContent.damageType === DamageType.None) {
        fileContent.effectText = results["title"]
    }
    if (process.env.NODE_ENV == "development")
        console.log("toSpell", { file: fileContent, result: results })
    return fileContent
}

export default roll20Importer