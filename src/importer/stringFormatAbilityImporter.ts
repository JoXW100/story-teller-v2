import { DiceType, AbilityType, ActionType, EffectCondition, TargetType, DamageType } from "types/database/dnd";
import { CalculationMode } from "types/database/editor";
import { AbilityMetadata } from "types/database/files/ability";

const getAbilityType = (ability: string): AbilityType => {
    switch (ability?.toLowerCase()) {
        case "melee weapon attack":
            return AbilityType.MeleeWeapon
        case "ranged weapon attack":
            return AbilityType.RangedWeapon
        case "melee attack": // unknown
            return AbilityType.MeleeAttack
        case "ranged attack": // unknown
            return AbilityType.RangedAttack
        default:
            return AbilityType.Feature
    }
}

const getTargetType = (target: string): TargetType => {
    switch (target?.toLowerCase()) {
        case "one target":
        case "one creature":
            return TargetType.Single
        case "self": // unknown
            return TargetType.Self
        case "point": // unknown
            return TargetType.Point
        default:
            return TargetType.None
    }
}

const getRollMod = (roll: string): number => {
    var value = Number(roll.replace(' ', '') ?? "0")
    return value ? value : 0
}

const getRange = (range: string): { range: number, rangeLong?: number } => {
    var splits = range.split('/')
    var res = { range: 0 }
    if (splits[0])
        res['range'] = Number(splits[0]) ? Number(splits[0]) : 0
    if (splits[1])
        res['rangeLong'] = Number(splits[1]) ? Number(splits[1]) : 0
    return res
}

const getAction = (action: string): ActionType => {
    switch (action?.toLowerCase()) {
        case "none":
            return ActionType.None
        case "special":
            return ActionType.Special
        case "reaction":
            return ActionType.Reaction
        case "bonus action":
        case "bonus":
            return ActionType.BonusAction
        default:
            return ActionType.Action
    }
}

const roll20AbilityExpr = /^^(?:([A-z ]+): *)?([A-z 0-9-\(\)]+)\. *(?:([A-z ]+): *([+-][0-9]+) *to hit,[A-z ]+([0-9]+(?:\/[0-9]+)?) [^.]+\., *([^.]+)[^:]+: *\(([0-9]+)d([0-9]+) *([+-] *[0-9]+)\) *([A-z]+)[^.]+. *)?(.*)?/m
const toAbility = async (text: string): Promise<AbilityMetadata> => {
    var res = new RegExp(roll20AbilityExpr).exec(text)
    console.log("toAbility", text, res)
    if (!res || !res[2])
        return null
    var type = getAbilityType(res[3])
    var result: AbilityMetadata
    switch (type) {
        case AbilityType.Feature:
            result = {
                name: res[2] ?? "Missing name",
                description: res[11] ?? "",
                type: type
            }
            break;
        default:
            var dmgNumDice = Number(res[7] ?? "1")
            var dmgDice = Number(res[8] ?? "0")
            result = {
                name: res[2] ?? "Missing name",
                description: res[11] ?? "",
                type: type,
                action: getAction(res[1]),
                condition: EffectCondition.Hit,
                conditionModifier: { type: CalculationMode.Override, value: getRollMod(res[4]) },
                effectDiceNum: dmgNumDice ? dmgNumDice : 1,
                effectDice: Object.values(DiceType).includes(dmgDice as DiceType) ? dmgDice : DiceType.None,
                effectModifier: { type: CalculationMode.Override, value: getRollMod(res[9]) },
                damageType: Object.values(DamageType).includes(res[10] as DamageType) ? res[10] as DamageType : DamageType.None,
                ...getRange(res[5]),
                target: getTargetType(res[6]),
                
            }
            break
    }
    console.log("toAbility", { file: result, result: res })
    return result
}

export {
    toAbility
}