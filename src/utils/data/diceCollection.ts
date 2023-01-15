
import Dice from 'utils/data/dice';
import { DiceResult, RollMethod, RollResult, RollValue } from 'types/dice';


class DiceCollection {
    private collection: Record<string, number>;
    public modifier: number;
    public desc: string;

    constructor(modifier: number | null = 0, desc: string | null = 'Rolled') {
        this.collection = {};
        this.modifier = modifier;
        this.desc = desc;
    }

    /** Adds a number of dice to the collection */
    add(dice: Dice, num: number) {
        var value = this.collection[dice.num] ?? 0;
        this.collection[dice.num] = value + num;
    }

    /** Rolls the dice in the collection */
    roll(method: RollMethod | null = RollMethod.Normal): RollResult {
        var results: RollValue[] = [];
        var selectedIndex = 0;
        switch (method) {
            case RollMethod.Crit:
                var result: DiceResult[] = this.map((value) => ({ 
                    dice: value.dice, 
                    num: value.num * 2, 
                    result: value.dice.roll(value.num * 2)
                }));
                var sum = result.flatMap(x => x.result).reduce((prev, val) => prev + val, 0);
                results = [{ values: result, sum: sum }];
                selectedIndex = 0;
                break;

            case RollMethod.Disadvantage:
            case RollMethod.Advantage:
                var roll1 = this.roll(RollMethod.Normal);
                var roll2 = this.roll(RollMethod.Normal);
                var res1 = roll1.results[roll1.selectedIndex];
                var res2 = roll2.results[roll2.selectedIndex]
                results = [res1, res2];
                selectedIndex = +((res1.sum < res2.sum) === (method === RollMethod.Advantage));
                break;

            case RollMethod.Normal:
            default:
                var result: DiceResult[] = this.map((value) => ({ 
                    dice: value.dice, 
                    num: value.num, 
                    result: value.dice.roll(value.num)
                } as DiceResult));
                var sum = result.flatMap(x => x.result).reduce((prev, val) => prev + val, 0);
                results = [{ values: result, sum: sum }];
                selectedIndex = 0;
                break;
        }

        return {
            method: method,
            results: results,
            selectedIndex: selectedIndex,
            desc: this.desc,
            modifier: this.modifier
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