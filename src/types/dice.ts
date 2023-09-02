import Dice from "utils/data/dice"

export enum RollType {
    General = 'general',
    Attack = 'attack',
    Damage = 'dmg',
    Save = 'save',
    Check = 'check',
    Initiative = 'initiative',
    Health = 'health'
}

interface DiceResult {
    dice: Dice
    num: number
    sum: number
    result: number[]
}

interface RollValue {
    sum: number
    isCritical: boolean
    isFail: boolean
    values: DiceResult[]
}

interface RollResult {
    method: RollMethod
    results: RollValue[]
    selectedIndex: number
    modifier: number
    type: RollType
    description: string
    details: string
    source: string
}

export enum RollMethod {
    Normal = "Normal",
    Advantage = "Advantage",
    Disadvantage = "Disadvantage",
    Crit = "Crit"
}

export type {
    DiceResult,
    RollValue,
    RollResult
}