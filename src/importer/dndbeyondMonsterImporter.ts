import { Alignment, CreatureType, DiceType, MovementType, SizeType } from "types/database/dnd"
import { CalculationMode, OptionType } from "types/database/editor"
import { CreatureMetadata } from "types/database/files/creature"

const hpSplitExpr = /([0-9]+) *\(([0-9]+)d([0-9]+)([\+\-][0-9]+)?\)/
const challengeMatchExpr = /([0-9]+)(?:\/([0-9]+))?/
const speedMatchExpr = /(?:([A-z]+) *)?([0-9]+)/g

const first = (res: any[]) => res ? res[0] : res
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

const getType = (type: string) => {
    var key = Object.keys(CreatureType).find((key) => (
        type?.includes(CreatureType[key])
    ))
    return key ? CreatureType[key] : CreatureType.None
}

const getSize = (type: string) => {
    var key = Object.keys(SizeType).find((key) => (
        type?.includes(SizeType[key])
    ))
    return key ? SizeType[key] : SizeType.Medium
}

const splitHP = (hp: string) => {
    var res = hpSplitExpr.exec(hp ?? "")
    return {
        hp: Number(res[1]),
        num: Number(res[2]),
        dice: Number(res[3]),
        mod: Number(res[4])
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

const roll20MonsterExpr = /<div *(?:class="([^"]*)")?[^>]*>\n?([^\n\t<>][^<>]*)/gm
const roll20MonsterNameExpr = /<h1 *class="page-title" *>[ \n\t]*([A-z0-9 \-\(\)]+)/m

export const importRoll20Monster = async (url: string): Promise<CreatureMetadata> => {
    if (!url.includes("roll20.net/compendium/dnd5e"))
        return null

    try {
        var res = await fetch(url, { method: 'GET' })
        var text = await res.text()
        // Trim text
        var results = {}
        var start = text.search(/<div *id="pageAttrs" *[A-z0-9=\"\- ]*>/)
        var tileRes = roll20MonsterNameExpr.exec(text.slice(0, start)) ?? []
        results['title'] = tileRes[1] 
        text = text.slice(start)
        var end = text.search(/<script *type="text\/javascript" *>/)
        text = text.slice(0, end).trim()
        
        
        var expr = new RegExp(roll20MonsterExpr)
        var hit: RegExpExecArray = null;
        var key = null
        while(null != (hit = expr.exec(text))){
            if (hit[1] == "value") {
                results[key] = hit[2].toLowerCase()
            } else {
                key = hit[2]?.toLowerCase()
            }
        }
        return toMonster(results)
    } catch (error) {
        console.error(error)
        return null
    }
}

const toMonster = (results: {[key: string]: string}): CreatureMetadata => {
    var ac = Number(results['ac'] ? first(/-?[0-9]+/.exec(results['ac'])) : undefined)
    var { hp, num, dice, mod } = splitHP(results['hp'])
    var passive = `passive perception ${results['passive perception'] ?? "10"}`
    var senses = results['senses'] ? [passive , results['senses']] : [passive]
    var fileContent: CreatureMetadata = {
        name: results['title'] ?? "Missing name",
        type: getType(results['type']),
        size: getSize(results['size']),
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

    console.log({ file: fileContent, result: results })

    return fileContent
}