import Dice from "utils/data/dice"
import { DateValue } from "./database"

interface DiceResult {
    dice: Dice
    num: number
    result: number[]
}

interface RollValue {
    sum: number
    values: DiceResult[]
}

interface RollResult {
    method: RollMethod
    results: RollValue[]
    selectedIndex: number
    desc: string
    modifier: number
}

interface RollEvent {
    result: RollResult
    time: DateValue
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
    RollResult,
    RollEvent
}