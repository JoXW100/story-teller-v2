import Logger from "utils/logger";
import { DiceType, AbilityType, ActionType, EffectCondition, TargetType, DamageType } from "types/database/dnd";
import { CalculationMode } from "types/database/editor";
import { IAbilityMetadata } from "types/database/files/ability";
import { asEnum } from "utils/helpers";

const getAbilityType = (ability: string): AbilityType => {
    switch (ability?.toLowerCase()) {
        case "melee weapon attack":
            return AbilityType.MeleeWeapon
        case "ranged weapon attack":
            return AbilityType.RangedWeapon
        case "melee attack": // unknown
            return AbilityType.MeleeAttack
        case "ranged attack": // unknown
        case "melee or ranged weapon attack":
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

const getRollMod = (roll: string | null): number => {
    if (roll) {
        var value = Number(roll.replace(' ', '') ?? "0")
        return value ? value : 0
    }
    return 0
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

const getAction = (action: string, type: AbilityType): ActionType => {
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
        case "action":
            return ActionType.Action
        default:
            return type === AbilityType.Feature 
                ? ActionType.None
                : ActionType.Action
    }
}

const roll20AbilityExpr = /^(?:([A-z ]+): *)?([A-z 0-9-\(\)]+)\. *(?:([A-z ]+): *([+-][0-9]+) *to hit,?.*[A-z ]+([0-9]+(?:\/[0-9]+)?)[^.]+\.,? *([^.]+)[^:]+: *(?:[0-9]+)? *\(([0-9]+)d([0-9]+) *([+-] *[0-9]+)?\) *([A-z]+)[^.]+. *)?(.*)?/mi
const toAbility = async (text: string): Promise<IAbilityMetadata> => {
    var res = new RegExp(roll20AbilityExpr).exec(text)
    if (!res || !res[2])
        return null
    var type = getAbilityType(res[3])
    var result: IAbilityMetadata
    switch (type) {
        case AbilityType.Feature:
            result = {
                name: res[2] ?? "Missing name",
                description: res[11] ?? "",
                type: type,
                action: getAction(res[1], type)
            } satisfies IAbilityMetadata
            break;
        default:
            var dmgNumDice = Number(res[7] ?? "1")
            result = {
                name: res[2] ?? "Missing name",
                description: res[11] ?? "",
                type: type,
                action: getAction(res[1], type),
                condition: EffectCondition.Hit,
                conditionModifier: { type: CalculationMode.Override, value: getRollMod(res[4]) },
                effectDiceNum: isNaN(dmgNumDice) ? 1 : dmgNumDice,
                effectDice: asEnum(Number(res[8]), DiceType) ?? DiceType.None,
                effectModifier: { type: CalculationMode.Override, value: getRollMod(res[9]) },
                damageType: asEnum(res[10], DamageType) ?? DamageType.None,
                ...getRange(res[5]),
                target: getTargetType(res[6]),
            } satisfies IAbilityMetadata
            break
    }
    Logger.log("toAbility", { file: result, result: res })
    return result
}

export {
    toAbility
}