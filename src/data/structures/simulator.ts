import { ISpellMetadata } from "types/database/files/spell";
import AbilityData from "./ability";
import CreatureData from "./creature";
import SpellData from "./spell";
import CreatureActionData from "./creatureActionData";
import { IEncounterCard } from "types/database/files/encounter";
import { IAbilityMetadata } from "types/database/files/ability";
import { AbilityType, ActionType, CastingTime, EffectCondition } from "types/database/dnd";
import DiceCollection from "utils/data/diceCollection";
import Dice from "utils/data/dice";
import { RollMethod, RollResult, RollType } from "types/dice";
import ICreatureStats from "types/database/files/iCreatureStats";
import { FileType } from "types/database/files";

export interface SimulatorCreatureState {
    creature: CreatureData
    data: IEncounterCard
    initiative: number
    order: number
    identifier: number
}

export interface SimulationAttack {
    type: FileType
    data: CreatureActionData
    averageDamage: number
    damage: DiceCollection[]
    hitModifier: number
    difficulty: number 
}

export interface SimulationAttackData {
    target: SimulatorCreatureState
    active: SimulatorCreatureState
    data: CreatureActionData
    hit: RollResult
    isHit: boolean
    damage: RollResult[]
    total: number
}

export interface SimulationResult {
    type: "attack" | "none"
    value?: number
    attacks?: SimulationAttackData[]
}

const CastTimeToActionMap: Partial<Record<CastingTime, ActionType>> = {
    [CastingTime.Action]: ActionType.Action,
    [CastingTime.BonusAction]: ActionType.BonusAction,
    [CastingTime.Reaction]: ActionType.Reaction
}

class Simulator {
    private readonly creatures: CreatureData[]
    private readonly abilities: Record<string, IAbilityMetadata>
    private readonly spells: Record<string, ISpellMetadata>
    private turn: number

    public constructor(creatures: CreatureData[], abilities: Record<string, IAbilityMetadata>, spells: Record<string, ISpellMetadata>) {
        this.creatures = creatures
        this.abilities = abilities
        this.spells = spells
        this.turn = 0
    }

    public simulateTurn(turnOrder: SimulatorCreatureState[]): SimulationResult {
        let active = turnOrder[0]
        let targets = turnOrder.filter(x => x.data.group !== active.data.group && x.data.health > 0)
        let stats = active.creature.getStats()
        this.turn++

        if (active.data.health > 0 && targets.length > 0) {
            let multiAttack = 1;
            let actions = [ActionType.Action, ActionType.BonusAction, ActionType.Legendary]
            let attackData: SimulationAttackData[] = []
            // Randomly select target
            let targetIndex = Math.floor(Math.random() * targets.length)
            let target = targets[targetIndex]

            for (let i = 0; i < actions.length; i++) {
                if (!target) break;
                let ability = this.findBestAttacks(active, target, stats, actions[i])
                let spell = this.findBestSpells(active, target, stats, actions[i])
                let attack = (ability?.averageDamage ?? 0) > (spell?.averageDamage ?? 0) ? ability : spell
                let data = Simulator.rollAttackResult(attack, active, target, stats)
                if (!data) continue;

                // Find new target if current is dead
                if (data.isHit && data.total > target.data.health) {
                    targets = [...targets.slice(0, targetIndex), ...targets.slice(targetIndex + 1)]
                    target = targets[Math.floor(Math.random() * targets.length)]
                }

                if (i == 0 && multiAttack < active.creature.multiAttack && attack.type === FileType.Ability) {
                    multiAttack++
                    i--
                }

                attackData.push(data)
            }
            // Resolve attacks
            return {  
                type: "attack",
                attacks: attackData
            }
        }

        return {  type: "none" }
    }

    private static rollAttackResult(attack: SimulationAttack, active: SimulatorCreatureState, target: SimulatorCreatureState, stats: ICreatureStats): SimulationAttackData {
        let hitCollection: DiceCollection = null
        switch (attack && attack.data.condition) {
            case EffectCondition.Hit:
                hitCollection = new DiceCollection(attack.hitModifier, `${attack.data.name} Attack`, undefined, RollType.Attack, stats.critRange)
                break
            case EffectCondition.Save:
                hitCollection = new DiceCollection(attack.hitModifier, `${attack.data.name} ${attack.data.saveAttr.toUpperCase()} Save`, target.creature.name, RollType.Save, stats.critRange)
                break
            default:
                return null;
        }

        hitCollection.add(new Dice(20))
        let hitResult = hitCollection.roll(RollMethod.Normal, active.creature.name)
        let damage = attack.damage.map(x => x.roll(hitResult.results[hitResult.selectedIndex].isCritical ? RollMethod.Crit : RollMethod.Normal, active.creature.name))

        let isHit: boolean = false
        switch (attack && attack.data.condition) {
            case EffectCondition.Hit:
                isHit = (hitResult.results[hitResult.selectedIndex].sum + hitResult.modifier) >= attack.difficulty
                break
            case EffectCondition.Save:
                isHit = (hitResult.results[hitResult.selectedIndex].sum + hitResult.modifier) < attack.difficulty
                break
            default:
                return null;
        }
        console.log("simulator.isHit", isHit, hitResult, attack)

        return {
            target: target,
            active: active,
            data: attack.data,
            hit: hitResult,
            isHit: isHit,
            damage: damage,
            total: damage.reduce((prev, x) => x.results[x.selectedIndex].sum + x.modifier + prev, 0)
        }
    }

    private findBestAttacks(active: SimulatorCreatureState, target: SimulatorCreatureState, stats: ICreatureStats, action: ActionType): SimulationAttack {
        let bestAction: SimulationAttack = null
        for (const id of active.creature.abilities) {
            let ability = new AbilityData(this.abilities[String(id)], stats)
            if (ability.type !== AbilityType.Feature && ability.action === action) {
                switch (ability.condition) {
                    case EffectCondition.Hit:
                        var modifier = ability.conditionModifierValue
                        var difficulty = target.creature.acValue
                        var hitChance = Math.min(Math.max(1 - (difficulty - modifier) / 20, 0), 1)
                        break;
                    case EffectCondition.Save:
                        var modifier = target.creature.getSaveModifier(ability.saveAttr) + 10
                        var difficulty = ability.conditionModifierValue + 8
                        var hitChance = Math.min(Math.max(1 - (difficulty - modifier) / 20, 0), 1)
                        break;
                    case EffectCondition.None: // For now ignore..
                        var targetDifficulty = 0
                    default:
                        break
                }
                let damage = ability.getDamageOnHit()
                let average = damage.reduce((prev, x) => prev + x.average, 0) * hitChance * (action === ActionType.Action ? stats.multiAttack : 1)
                if ((bestAction?.averageDamage ?? 0) < average) {
                    bestAction = { type: FileType.Ability, data: ability, averageDamage: average, damage: damage, hitModifier: modifier, difficulty: difficulty }
                }
            }
        }
        return bestAction
    }

    private findBestSpells(active: SimulatorCreatureState, target: SimulatorCreatureState, stats: ICreatureStats, action: ActionType): SimulationAttack {
        let bestAction: SimulationAttack = null
        for (const id of active.creature.spells) {
            let spell = new SpellData(this.spells[String(id)], stats)
            if (CastTimeToActionMap[spell.time] === action) {
                switch (spell.condition) {
                    case EffectCondition.Hit:
                        var modifier = spell.conditionModifierValue
                        var difficulty = target.creature.acValue
                        var hitChance = Math.min(Math.max(1 - (difficulty - modifier) / 20, 0), 1)
                        break;
                    case EffectCondition.Save:
                        var modifier = target.creature.getSaveModifier(spell.saveAttr) + 10
                        var difficulty = spell.conditionModifierValue + 8
                        var hitChance = Math.min(Math.max(1 - (difficulty - modifier) / 20, 0), 1)
                        break;
                    case EffectCondition.None: // For now ignore..
                        var difficulty = 0
                    default:
                        break
                }
                let damage = spell.getDamageOnHit()
                let average = damage.reduce((prev, x) => prev + x.average, 0) * hitChance
                if ((bestAction?.averageDamage ?? 0) < average) {
                    bestAction = { type: FileType.Spell, data: spell, averageDamage: average, damage: damage, hitModifier: modifier, difficulty: difficulty }
                }
            }
        }
        return bestAction
    }

    public getTurnOrder(data: IEncounterCard[]): SimulatorCreatureState[] {
        let order = this.creatures.map<SimulatorCreatureState>((creature, index) => ({ 
            creature: creature,
            data: {...data[index], health: data[index]?.health ?? creature.healthValue},
            initiative: creature.initiativeValue + data[index]?.initiative,
            order: (creature.initiativeValue + data[index]?.initiative << 4) + creature.initiativeValue,
            identifier: index
        })).sort((a,b) => (b.order - a.order))
        let turn = this.turn % this.creatures.length
        return [...order.slice(turn), ...order.slice(0, turn)]
    }

    public get round() {
        return Math.floor(this.turn / this.creatures.length) + 1
    }
}

export default Simulator