
import Dice from 'utils/data/dice';
import { DiceResult, RollMethod, RollResult, RollType, RollValue } from 'types/dice';


class DiceCollection {
    private readonly collection: Record<string, number>;
    public readonly modifier: number;
    public readonly description: string;
    public readonly details: string;
    public readonly type: RollType;
    public readonly canCritAndFail: boolean
    public readonly critRange: number

    constructor(modifier: number | null = 0, description: string = 'Rolled', details: string = null, type: RollType = RollType.General, canCritAndFail: boolean = false, critRange: number = 20) {
        this.collection = {};
        this.modifier = modifier;
        this.description = description;
        this.details = details;
        this.type = type;
        this.canCritAndFail = canCritAndFail
        this.critRange = critRange
    }

    /** Adds a number of dice to the collection */
    add(dice: Dice, num: number = 1) {
        let value = this.collection[dice.num] ?? 0;
        this.collection[dice.num] = value + num;
    }

    /** Rolls the dice in the collection */
    roll(method: RollMethod = RollMethod.Normal, source: string): RollResult {
        let results: RollValue[] = [];
        let selectedIndex = 0;
        switch (method) {
            case RollMethod.Crit:
                let critResult: DiceResult[] = this.map((value) => ({ 
                    dice: value.dice, 
                    num: value.num * 2, 
                    result: value.dice.roll(value.num * 2)
                }));
                let critSum = critResult.flatMap(x => x.result).reduce((prev, val) => prev + val, 0);
                results = [{ values: critResult, sum: critSum, isCritical: true, isFail: false }];
                selectedIndex = 0;
                break;

            case RollMethod.Disadvantage:
            case RollMethod.Advantage:
                let roll1 = this.roll(RollMethod.Normal, source);
                let roll2 = this.roll(RollMethod.Normal, source);
                let res1 = roll1.results[roll1.selectedIndex];
                let res2 = roll2.results[roll2.selectedIndex]
                results = [res1, res2];
                selectedIndex = +((res1.sum < res2.sum) === (method === RollMethod.Advantage));
                break;

            case RollMethod.Normal:
            default:
                let result: DiceResult[] = this.map((value) => ({ 
                    dice: value.dice, 
                    num: value.num, 
                    result: value.dice.roll(value.num)
                } as DiceResult));
                let sum = result.flatMap(x => x.result).reduce((prev, val) => prev + val, 0);
                let isCritical = result.length === 1 && result[0].dice.num === 20 && result[0].sum >= this.critRange
                let isFail = !isCritical && result.length === 1 && result[0].dice.num === 20 && sum === 1
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

    /** Gets the number of a type of dice in the collection */
    getNum(dice: Dice) {
        return this.collection[dice.num] ?? 0;
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
}

export default DiceCollection;