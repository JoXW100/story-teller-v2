import React, { useContext, useMemo } from 'react';
import Dice from 'utils/data/dice';
import DiceCollection from 'utils/data/diceCollection';
import { ParseError } from 'utils/parser';
import { D20Icon } from 'assets/dice';
import { Context } from 'components/contexts/storyContext';
import { openContext } from 'components/common/contextMenu';
import { CritIcon, AdvantageIcon, DisadvantageIcon } from 'assets/icons';
import Localization from 'utils/localization';
import { RollMethod } from 'types/dice';
import { Queries, ElementObject, ElementParams, Variables, RollMode } from 'types/elements';
import styles from 'styles/elements.module.scss';

interface MarginOptions extends Variables {
    dice?: string
    num?: string
    mod?: string
    mode?: RollMode
    desc?: string
    tooltips?: string
}

const validModes = new Set(['dice', 'mod', 'dmg']);
const validOptions = new Set(['dice', 'num', 'mod', 'mode', 'desc', 'tooltips']);
const validateOptions = (options: Variables): Queries => {
    Object.keys(options).forEach((key) => {
        if (!validOptions.has(key))
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
        if (!validModes.has(options.mode))
            throw new ParseError(`Invalid roll option value. mode: '${options.mode}', valid values: ${Array(validModes).join(', ')}`);
    }
    return {}
}

const RollElement = ({ children, options }: ElementParams<MarginOptions>): JSX.Element => {
    const [_, dispatch] = useContext(Context);
    const dice = options.dice ? new Dice(options.dice) : new Dice(20);
    const mode = options.mode ? options.mode : (dice.num === 20 || dice.num === 0) ? 'mod' : 'dice';
    const num = options.num ? parseInt(options.num) : 1;
    const mod = options.mod ? parseInt(options.mod) : 0;
    const show = mode === 'dice' || mode === 'dmg';
    const desc = options.desc ?? 'Rolled';

    const roll = (method: RollMethod) => {
        var collection = new DiceCollection(mod, desc);
        collection.add(dice, num);
        dispatch.roll(collection, method);
    }

    const context = useMemo(() => {
        return options.mode === 'dmg' 
        ? [
            {
                text: Localization.toText('roll-normal'), 
                icon: D20Icon, 
                action: () => roll(RollMethod.Normal)
            },
            { 
                text: Localization.toText('roll-crit'), 
                icon: CritIcon, 
                action: () => roll(RollMethod.Crit)
            }
        ] : [
            {
                text: Localization.toText('roll-normal'), 
                icon: D20Icon, 
                action: () => roll(RollMethod.Normal)
            },
            { 
                text: Localization.toText('roll-advantage'), 
                icon: AdvantageIcon, 
                action: () => roll(RollMethod.Advantage)
            },
            { 
                text: Localization.toText('roll-disadvantage'), 
                icon: DisadvantageIcon, 
                action: () => roll(RollMethod.Disadvantage)
            }
        ]
    }, [options.mode])

    function handleContext(e: React.MouseEvent<HTMLSpanElement, MouseEvent>) {
        e.preventDefault();
        e.stopPropagation();
        openContext(context, { x: e.pageX, y: e.pageY }, true);
    }

    function handleClick(e: React.MouseEvent<HTMLSpanElement, MouseEvent>) {
        e.preventDefault();
        e.stopPropagation();
        roll(RollMethod.Normal);
    }

    const modText = (show && mod === 0) ? '' 
        : mod < 0 ? ` - ${Math.abs(mod)}`
        : ` + ${mod}`;

    return (
        <span 
            className={styles.dice}
            onClick={handleClick}
            onContextMenu={handleContext}
            tooltips={options.tooltips}
        >
            { !show ? modText
                : `${num}${dice.text}${modText} `}
            { children }
        </span>
    )
}

export const element: { [key: string]: ElementObject } = {
    'roll': {
        type: 'roll',
        defaultKey: 'dice',
        validOptions: validOptions,
        toComponent: RollElement,
        validate: validateOptions
    }
}

export default RollElement;