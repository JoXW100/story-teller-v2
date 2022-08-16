import { RollMethod } from '@enums/data';
import Dice from 'utils/data/dice';



class DiceCollection {
    /** @type {Object.<string, number>} */
    #collection;
    /** @type {number} */
    #modifier;
    /** @type {string} */
    #desc;

    /**
     * @param {number?} modifier 
     * @param {string?} desc 
     */
    constructor(modifier = 0, desc = 'Rolled') {
        this.#collection = {};
        this.#modifier = modifier;
        this.#desc = desc;
    }

    /** @returns {number} */
    get modifier() { return this.#modifier }
    /** @param {number} value */
    set modifier(value) { this.#modifier = value }

    /** @returns {string} */
    get desc() { return this.#desc }
    /** @param {string} value */
    set desc(value) { this.#desc = value }

    /** 
     * @param {Dice} dice 
     * @param {number} num
     * @param {number} mod 
     */
    add(dice, num) {
        var value = this.#collection[dice.num] ?? 0;
        this.#collection[dice.num] = value + num;
    }

    /** 
     * @param {RollMethod?} method
     * @returns {RollResult} 
     */
    roll(method = RollMethod.Normal) {
        var results = [];
        var selectedIndex = 0;
        switch (method) {
            case RollMethod.Crit:
                var result = this.map((value) => ({ 
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
                var result = this.map((value) => ({ 
                    dice: value.dice, 
                    num: value.num, 
                    result: value.dice.roll(value.num)
                }));
                var sum = result.flatMap(x => x.result).reduce((prev, val) => prev + val, 0);
                results = [{ values: result, sum: sum }];
                selectedIndex = 0;
                break;
        }

        return {
            method: method,
            results: results,
            selectedIndex: selectedIndex,
            desc: this.#desc,
            modifier: this.#modifier
        }
    }

    /**
     * 
     * @param {Dice} dice 
     */
    getNum(dice) {
        return this.#collection[dice.num] ?? 0;
    }

    /**
     * @param {(value: { dice: Dice, num: number }, index: number) => any} action 
     * @returns {[any]}
     */
    map(action) {
        return Object.keys(this.#collection).map((key, index) => 
            action({ dice: new Dice(key), num: this.#collection[key] }, index)
        );
    }

    /**
     * @param {(value: { dice: Dice, num: number }, index: number) => any} action 
     * @returns {boolean}
     */
    some(action) {
        return Object.keys(this.#collection).some((key, index) => 
            action({ dice: new Dice(key), num: this.#collection[key] }, index)
        );
    }
}

export default DiceCollection;