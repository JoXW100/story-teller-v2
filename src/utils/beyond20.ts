import { RollMethod, RollResult, RollType, RollValue } from "types/dice";

type MessageType = "rendered-roll" | "hp-update"
export enum WhisperType {
    NO = 0,
    YES = 1,
    QUERY = 2,
    HIDE_NAMES = 3
} 
type RequestType = "chat-message" | "skill" | "ability" | "saving-throw" | "initiative" | "initiative-tracker" | "hit-dice" | "item" | "trait" | "death-save" | "attack" | "spell-card" | "spell-attack" | "chat-message" | "roll-table" | "avatar"

interface Beyond20Dice {
    amount: number
    faces: number
    formula: string
    modifiers: string
    rolls: { roll: number }[]
    total: number
}

interface Beyond20Roll {
    total?: number
    discarded?: boolean
    formula?: string
    parts?: (Beyond20Dice | number | '-' | '+')[]
    "critical-success"?: boolean
    "critical-failure"?: boolean
}

interface Beyond20RollRequest {
    action: MessageType
    request?: {
        type: RequestType
        action?: string
        damages?: unknown[]
        rollAttack?: boolean
        rollDamage?: boolean
        sendMessage?: boolean
        range?: string
        "save-dc"?: string
        "save-ability"?: string
        "cast-at"?: string[]
        components?: string
        "to-hit"?: string
        advantage?: number
        initiative?: string
        character?: {
            name?: string
            type?: string
            settings?: {
                "custom-roll-dice": string
            }
        }
    }
    character?: string | {
        name?: string
        hp?: number
        "max-hp"?: number
        "temp-hp"?: number
    }
    title?: string
    source?: string
    attributes?: Record<string, any>
    open?: boolean
    description?: string
    roll_info?: [name: string, value: any][]
    attack_rolls?: Beyond20Roll[]
    damage_rolls?: [name: string, roll: Beyond20Roll, flag?: number][]
    total_damages?: Record<string, Beyond20Roll>
    play_sound?: boolean
    whisper?: WhisperType
}
const interleave = (arr:any[], x: any) => arr.flatMap(e => [e, x]).slice(0, -1)

abstract class Beyond20 {
    private static readonly EventId = "Beyond20_SendMessage"
    
    public static sendRoll(roll: RollResult, whisper: WhisperType = WhisperType.NO) {
        console.log("roll", roll)
        switch (roll.type) {
            case RollType.Attack:
                return this.sendAttackRoll(roll, whisper)
            case RollType.Damage:
                return this.sendDamageRoll(roll, whisper)
            case RollType.Initiative:
                return this.sendInitiativeRoll(roll, whisper)
            case RollType.Health:
            case RollType.Check:
            case RollType.Save:
            default:
                return this.sendAttackRoll(roll, whisper)
        }
    }

    private static calcFormula(roll: RollResult, value: RollValue): string {
        return value.values.map(x => `${x.num}${x.dice.text}`).join(' + ') + (roll.modifier != 0 ? ` ${roll.modifier > 0 ? '+' : '-'} ${Math.abs(roll.modifier)}` : '')
    }
    
    public static sendAttackRoll(roll: RollResult, whisper: WhisperType) {
        this.sendMessage({ 
            action: "rendered-roll",
            request: { type: "attack", },
            title: roll.description,
            character: roll.source ?? this.calcFormula(roll, roll.results[roll.selectedIndex]),
            attack_rolls: roll.results.map((res, index) => ({
                total: res.sum + roll.modifier,
                discarded: roll.selectedIndex !== index,
                parts: [interleave(res.values.map(x => ({
                    amount: x.num,
                    faces: x.dice.num,
                    rolls: x.result.map(y => ({ roll: y })),
                    formula: `${x.num}${x.dice.text}`,
                    total: x.sum,
                })), '+'), roll.modifier !== 0 ? [roll.modifier > 0 ? '+' : '-', Math.abs(roll.modifier)] : []].flat(),
                formula: this.calcFormula(roll, res)
            })),
            damage_rolls: [],
            total_damages: {},
            whisper: whisper
        } satisfies Beyond20RollRequest)
    }
    
    public static sendDamageRoll(roll: RollResult, whisper: WhisperType) {
        this.sendMessage({ 
            action: "rendered-roll",
            request: { type: "attack" },
            title: roll.description,
            character: roll.source ?? this.calcFormula(roll, roll.results[roll.selectedIndex]),
            attack_rolls: [],
            damage_rolls: roll.results.map((res, index) => (
                [roll.details, {
                    "critical-success": res.isCritical,
                    "critical-failure": res.isFail,
                    discarded: roll.selectedIndex !== index,
                    total: res.sum + roll.modifier,
                    parts: [interleave(res.values.map(x => ({
                        amount: x.num,
                        faces: x.dice.num,
                        rolls: x.result.map(y => ({ roll: y })),
                        formula: `${x.num}${x.dice.text}`,
                        total: x.sum,
                    })), '+'), roll.modifier !== 0 ? [roll.modifier > 0 ? '+' : '-', Math.abs(roll.modifier)] : []].flat(),
                    formula: this.calcFormula(roll, res)
                } satisfies Beyond20Roll, 1]
            )),
            total_damages: {},
            whisper: whisper
        } satisfies Beyond20RollRequest)
    }
    
    public static sendInitiativeRoll(roll: RollResult, whisper: WhisperType) {
        this.sendMessage({ 
            action: "rendered-roll",
            request: { 
                type: "initiative",
                advantage: roll.method === RollMethod.Advantage ? 1 : 0,
                initiative: (roll.modifier >= 0 ? '+' : '-') + Math.abs(roll.modifier),
                sendMessage: true
            },
            title: `${roll.description}${roll.modifier !== 0 ? ` (${roll.modifier > 0 ? '+' : '-'}${Math.abs(roll.modifier)})` : ''}`,
            character: roll.source ?? this.calcFormula(roll, roll.results[roll.selectedIndex]),
            attack_rolls: roll.results.map((res, index) => ({
                total: res.sum + roll.modifier,
                discarded: roll.selectedIndex !== index,
                parts: [interleave(res.values.map(x => ({
                    type: "initiative",
                    amount: x.num,
                    faces: x.dice.num,
                    rolls: x.result.map(y => ({ roll: y })),
                    formula: `${x.num}${x.dice.text}`,
                    total: x.sum,
                })), '+'), roll.modifier !== 0 ? [roll.modifier > 0 ? '+' : '-', Math.abs(roll.modifier)] : []].flat(),
                formula: this.calcFormula(roll, res)
            })),
            damage_rolls: [],
            total_damages: {},
            whisper: whisper
        } satisfies Beyond20RollRequest)
    }
    
    public static sendHealthUpdate(name: string, hp: number, maxHp: number, tempHp: number) {
        this.sendMessage({ 
            action: "hp-update",
            character: {
                name: name,
                hp: hp,
                "max-hp": maxHp,
                "temp-hp": tempHp
            }
        } satisfies Beyond20RollRequest)
    }

    private static sendMessage(message: any) {
        let event = new CustomEvent(this.EventId, { detail: [message]});
        document.dispatchEvent(event)
    }
}

export default Beyond20