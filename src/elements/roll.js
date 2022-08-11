import { useContext } from 'react';
import { Context } from 'components/contexts/storyContext';
import Dice from 'utils/data/dice';
import { ParseError } from 'utils/parser';
import styles from 'styles/elements/main.module.scss';
import DiceCollection from 'utils/data/diceCollection';

const validOptions = ['dice', 'num', 'mod', 'showDice'];
const validateOptions = (options) => {
    Object.keys(options).forEach((key) => {
        if (!validOptions.some((x) => x === key))
            throw new ParseError(`Unexpected roll option: '${key}'`);
    });

    if (options.dice) {
        var num = parseInt(options.dice)
        if (isNaN(num) || num <= 0)
            throw new ParseError(`Invalid roll option value. dice: '${options.dice}', must be an integer > 0`);
    }

    if (options.num) {
        var num = parseInt(options.num)
        if (isNaN(num) || num <= 0)
            throw new ParseError(`Invalid roll option value. num: '${options.num}', must be an integer > 0`);
    }

    if (options.mod) {
        var num = parseInt(options.mod)
        if (isNaN(num))
            throw new ParseError(`Invalid roll option value. mod: '${options.mod}', must be an integer`);
    }

    if (options.showDice) {
        if (options.showDice !== 'true' && options.showDice != 'false')
            throw new ParseError(`Invalid roll option value. showDice: '${options.showDice}', must be true or false`);
    }
}

/**
 * @param {{ options: Object.<string, string>, children: JSX.Element }} 
 * @returns {JSX.Element}
 */
const RollElement = ({ children, options }) => {
    const [context, dispatch] = useContext(Context);

    const dice = options.dice ? new Dice(options.dice) : new Dice(20);
    const num = options.num ? parseInt(options.num) : 1;
    const mod = options.mod ? parseInt(options.mod) : 0;
    const show = options.showDice === 'true';

    const handleClick = () => {
        var collection = new DiceCollection();
        collection.add(dice, num);
        collection.modifier = mod;
        dispatch.roll(collection);
    }

    const modText = (show && mod === 0) ? '' 
        : mod < 0 ? `- ${Math.abs(mod)}`
        : `+ ${mod}`;

    return (
        <span 
            className={styles.dice}
            onClick={handleClick}
        >
            { !show ? modText
                : `${num}${dice.text} ${modText} `}
            { children }
        </span>
    )
}

/**
 * @type {Object.<string, RenderElement>}
 */
 export const element = {
    'roll': {
        type: 'roll',
        defaultKey: 'dice',
        validOptions: validOptions,
        toComponent: RollElement,
        validateOptions: validateOptions
    }
}

export default RollElement;