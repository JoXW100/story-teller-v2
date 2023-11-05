
import Dice from 'utils/data/dice';
import { DiceResult, RollMethod, RollResult, RollType, RollValue } from 'types/dice';
import { DiceType } from 'types/database/dnd';


class DiceCollection {
    protected readonly collection: Record<string, number>;
    public readonly modifier: number;
    public readonly description: string;
    public readonly details: string;
    public readonly type: RollType;
    public readonly critRange: number
    public readonly canCritAndFail: boolean

    constructor(modifier: number | null = 0, description: string = 'Rolled', details: string = null, type: RollType = RollType.General, critRange: number = 20) {
        this.collection = {};
        this.modifier = modifier;
        this.description = description;
        this.details = details;
        this.type = type;
        this.critRange = critRange
        this.canCritAndFail = this.type === RollType.Attack || type === RollType.Save
    }

    /** Adds a number of dice to the collection */
    public add(dice: Dice | DiceType, num: number = 1) {
        let key = dice instanceof Dice ? dice.num : dice
        let value = this.collection[key] ?? 0;
        this.collection[key] = value + num;
    }

    /** Rolls the dice in the collection */
    public roll(method: RollMethod = RollMethod.Normal, source: string): RollResult {
        let results: RollValue[] = [];
        let selectedIndex = 0;
        switch (method) {
            case RollMethod.Crit:
                var result: DiceResult[] = this.map((value) => {
                    let result = value.dice.roll(value.num * 2)
                    return { 
                        dice: value.dice, 
                        num: value.num * 2, 
                        result: result,
                        sum: result.reduce((prev, val) => prev + val, 0)
                    } satisfies DiceResult
                });
                var sum = result.reduce((prev, val) => prev + val.sum, 0)
                results = [{ values: result, sum: sum, isCritical: false, isFail: false } satisfies RollValue];
                selectedIndex = 0;
                break;

            case RollMethod.Disadvantage:
            case RollMethod.Advantage:
                var roll1 = this.roll(RollMethod.Normal, source);
                var roll2 = this.roll(RollMethod.Normal, source);
                var res1 = roll1.results[roll1.selectedIndex];
                var res2 = roll2.results[roll2.selectedIndex]
                results = [res1, res2];
                selectedIndex = +((res1.sum < res2.sum) === (method === RollMethod.Advantage));
                break;

            case RollMethod.Normal:
            default:
                var result: DiceResult[] = this.map((value) => {
                    let result = value.dice.roll(value.num)
                    return { 
                        dice: value.dice, 
                        num: value.num, 
                        result: result,
                        sum: result.reduce((prev, val) => prev + val, 0)
                    } satisfies DiceResult
                });
                var sum = result.reduce((prev, val) => prev + val.sum, 0)
                var isCritical = this.canCritAndFail && result.length === 1 && result[0].dice.num === 20 && result[0].sum >= this.critRange
                var isFail = this.canCritAndFail && !isCritical && result.length === 1 && result[0].dice.num === 20 && sum === 1
                results = [{ values: result, sum: sum, isCritical: isCritical, isFail: isFail }];
                selectedIndex = 0;
                break;
        }

        return {
            method: method,
            results: results,
            selectedIndex: selectedIndex,
            modifier: this.modifier,
            type: this.type,
            description: this.description,
            details: this.details,
            source: source
        }
    }

    public get average(): number {
        return Object.keys(this.collection).reduce((prev, key) => prev + Dice.average(key) * this.collection[key], this.modifier)
    }

    public get text(): string {
        let diceText = this.map((value) => `${value.num}${value.dice.text}`).join(' + ')
        return this.modifier === 0 ? diceText : `${diceText} ${this.modifier < 0 ? '-' : '+'} ${Math.abs(this.modifier)}`
    }

    public get length(): number {
        return Object.keys(this.collection).reduce((sum, key) => sum + (this.collection[key] ?? 0), 0)
    }

    /** Gets the number of a type of dice in the collection */
    getNum(dice: Dice | DiceType) {
        let key = dice instanceof Dice ? dice.num : dice
        return this.collection[key] ?? 0;
    }

    /** Iterates over the dice in the collection */
    map(action: (value: { dice: Dice; num: number; }, index: number) => any): any[] {
        return Object.keys(this.collection).map((key, index) => 
            action({ dice: new Dice(key), num: this.collection[key] }, index)
        );
    }

    /** Iterates over the dice in the collection until false is returned */
    some(action: (value: { dice: Dice; num: number; }, index: number) => any): boolean {
        return Object.keys(this.collection).some((key, index) => 
            action({ dice: new Dice(key), num: this.collection[key] }, index)
        );
    }

    reduce<T>(action: (prev: T, value: { dice: Dice; num: number; }, index: number) => T, init: T) {
        return Object.keys(this.collection).reduce((prev, key, index) => 
            action(prev, { dice: new Dice(key), num: this.collection[key] }, index)
        , init);
    }
}

export default DiceCollection;