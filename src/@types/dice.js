/**
 * @typedef DiceResult
 * @property {import('utils/data/dice').default} dice
 * @property {number} num
 * @property {[number]} result
 */ 

/**
 * @typedef RollValue
 * @property {number} sum
 * @property {[DiceResult]} values
 */

/**
 * @typedef RollResult
 * @property {import('@enums/data').RollMethod} method
 * @property {[RollValue]} results
 * @property {number} selectedIndex
 * @property {string} desc
 * @property {number} modifier
 */