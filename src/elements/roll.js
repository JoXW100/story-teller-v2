import React, { useContext, useMemo } from 'react';
import { Context } from 'components/contexts/storyContext';
import { openContext } from 'components/contextMenu';
import Dice from 'utils/data/dice';
import DiceCollection from 'utils/data/diceCollection';
import { ParseError } from 'utils/parser';
import { D20Icon } from 'assets/dice';
import { CritIcon, AdvantageIcon, DisadvantageIcon } from 'assets/icons';
import Localization from 'classes/localization';
import { RollMethod } from '@enums/data';
import styles from 'styles/elements/main.module.scss';

const validModes = ['dice', 'mod', 'dmg'];
const validOptions = ['dice', 'num', 'mod', 'mode', 'desc', 'tooltips'];
const validateOptions = (options) => {
    Object.keys(options).forEach((key) => {
        if (!validOptions.some((x) => x === key))
            throw new ParseError(`Unexpected roll option: '${key}'`);
    });

    if (options.dice) {
        var num = parseInt(options.dice)
        if (isNaN(num))
            throw new ParseError(`Invalid roll option value. dice: '${options.dice}', must be an integer`);
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

    if (options.mode) {
        if (!validModes.includes(options.mode))
            throw new ParseError(`Invalid roll option value. mode: '${options.mode}', valid values: ${validModes.join(', ')}`);
    }
}

/**
 * @typedef RollOptions 
 * @property {number} dice
 * @property {number} num
 * @property {number} mod
 * @property {'mod' | 'dice' | 'dmg'} mode
 * @property {string} desc
 * @property {string} tooltips
 * 
 * @param {{ options: RollOptions, children: JSX.Element }} 
 * @returns {JSX.Element}
 */
const RollElement = ({ children, options = {} }) => {
    const [_, dispatch] = useContext(Context);

    const dice = options.dice ? new Dice(options.dice) : new Dice(20);
    const mode = options.mode ? options.mode : (dice.num === 20 || dice.num === 0) ? 'mod' : 'dice';
    const num = options.num ? parseInt(options.num) : 1;
    const mod = options.mod ? parseInt(options.mod) : 0;
    const show = mode === 'dice' || mode === 'dmg';
    const desc = options.desc ?? 'Rolled';

    const context = useMemo(() => {
        return options.mode === 'dmg' 
        ? [
            {
                text: Localization.toText('roll-normal'), 
                icon: D20Icon, 
                action: () => Roll(RollMethod.Normal)
            },
            { 
                text: Localization.toText('roll-crit'), 
                icon: CritIcon, 
                action: () => Roll(RollMethod.Crit)
            }
        ] : [
            {
                text: Localization.toText('roll-normal'), 
                icon: D20Icon, 
                action: () => Roll(RollMethod.Normal)
            },
            { 
                text: Localization.toText('roll-advantage'), 
                icon: AdvantageIcon, 
                action: () => Roll(RollMethod.Advantage)
            },
            { 
                text: Localization.toText('roll-disadvantage'), 
                icon: DisadvantageIcon, 
                action: () => Roll(RollMethod.Disadvantage)
            }
        ]
    }, [options.mode])

    /** @param {React.MouseEvent<HTMLDivElement, React.MouseEvent>} e */
    const handleContext = (e) => {
        e.preventDefault()
        e.stopPropagation()
        openContext(context, { x: e.pageX, y: e.pageY }, true)
    }

    /** @param {React.MouseEvent<HTMLSpanElement, MouseEvent>} e*/
    const HandleClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        var collection = new DiceCollection(mod, desc);
        collection.add(dice, num);
        dispatch.roll(collection, RollMethod.Normal);
    }

    const modText = (show && mod === 0) ? '' 
        : mod < 0 ? `- ${Math.abs(mod)}`
        : `+ ${mod}`;

    

    return (
        <span 
            className={styles.dice}
            onClick={HandleClick}
            onContextMenu={handleContext}
            tooltips={options.tooltips}
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