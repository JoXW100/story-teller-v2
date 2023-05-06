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

interface RollOptions extends Variables {
    dice?: string
    num?: string
    mod?: string
    mode?: RollMode
    desc?: string
    tooltips?: string
}

class Options implements RollOptions {
    protected readonly options: RollOptions;
    [key: string]: any

    constructor(options: RollOptions) {
        this.options =  options ?? {}
    }
    
    public get dice(): string {
        return this.options.dice ?? "20"
    }

    public get diceValue(): Dice {
        let val = parseInt(this.dice)
        return new Dice(isNaN(val) ? 0 : val)
    }

    public get num(): string {
        return this.options.num ?? "1"
    }

    public get numValue(): number {
        let value = parseInt(this.num)
        return isNaN(value) ? 1 : value
    }

    public get mod(): string {
        return this.options.mod ?? "0"
    }

    public get modValue(): number {
        let value = parseInt(this.mod)
        return isNaN(value) ? 0 : value
    }

    public get mode(): RollMode {
        if (validModes.has(this.options.mode)) {
            return this.options.mode as RollMode
        }
        let dice = this.diceValue
        if (dice.num == 20 || dice.num == 0) {
            return RollMode.Mod
        }
        return RollMode.Dice
    }

    public get desc(): string {
        return this.options.desc ?? "20"
    }
    
    public get tooltips(): string {
        return this.options.tooltips ?? undefined
    }

    public get show(): boolean {
        return this.mode === RollMode.Dice 
            || this.mode === RollMode.DMG
    }

    public get description(): string {
        return this.options.desc ?? 'Rolled'
    }

    public get modText(): string {
        let mod = this.modValue
        if (this.show && mod === 0) {
            return ''
        }
        if (mod < 0) {
            return ` - ${Math.abs(mod)}`
        }
        return ` + ${mod}`
    }

    public get rollText(): string {
        if (this.show) {
            return `${this.num}${this.diceValue.text}${this.modText} `
        }
        return this.modText
    }
}

const validModes = new Set(Object.values(RollMode));
const validOptions = new Set(['dice', 'num', 'mod', 'mode', 'desc', 'tooltips']);
const validateOptions = (options: RollOptions): Queries => {
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
        if (!validModes.has(options.mode as RollMode))
            throw new ParseError(`Invalid roll option value. mode: '${options.mode}', valid values: ${Array(validModes).join(', ')}`);
    }
    return {}
}

const RollElement = ({ children, options, ...props }: ElementParams<RollOptions>): JSX.Element => {
    const [_, dispatch] = useContext(Context);
    const rollOptions = new Options(options);

    const roll = (method: RollMethod) => {
        var collection = new DiceCollection(rollOptions.modValue, rollOptions.desc);
        collection.add(rollOptions.diceValue, rollOptions.numValue);
        dispatch.roll(collection, method);
    }

    const context = useMemo(() => {
        return options.mode === RollMode.DMG 
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

    return (
        <span 
            className={styles.dice}
            onClick={handleClick}
            onContextMenu={handleContext}
            tooltips={options.tooltips}>
            {rollOptions.rollText}
            {children && <span>{children}</span> }
        </span>
    )
}

export const element: Record<string, ElementObject> = {
    'roll': {
        type: 'roll',
        defaultKey: 'dice',
        inline: true,
        lineBreak: false,
        container: false,
        toComponent: RollElement,
        validate: validateOptions
    }
}

export default RollElement;
export type {
    RollOptions
}