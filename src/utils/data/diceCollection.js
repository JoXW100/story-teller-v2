import Dice from 'utils/data/dice';

class DiceCollection {
    /** @type {Object.<string, number>} */
    #collection;
    /** @type {number} */
    #modifier;

    constructor() {
        this.#collection = {};
        this.#modifier = 0;
    }

    /** @returns {number} */
    get modifier() { return this.#modifier }
    /** @param {number} value */
    set modifier(value) { this.#modifier = value }

    /** 
     * @param {Dice} dice 
     * @param {number} num
     * @param {number} mod 
     */
    add(dice, num) {
        var value = this.#collection[dice.num] ?? 0;
        this.#collection[dice.num] = value + num;
    }

    /** @returns {RollResult} */
    roll() {
        return this.map((value) => ({ 
            dice: value.dice, 
            num: value.num, 
            result: value.dice.roll(value.num)
        }));
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