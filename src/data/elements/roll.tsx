import React, { useContext } from 'react';
import Dice from 'utils/data/dice';
import DiceCollection from 'utils/data/diceCollection';
import { ParseError } from 'utils/parser';
import { D20Icon } from 'assets/dice';
import { Context } from 'components/contexts/storyContext';
import { openContext } from 'components/common/contextMenu';
import { CritIcon, AdvantageIcon, DisadvantageIcon } from 'assets/icons';
import Localization from 'utils/localization';
import { RollMethod } from 'types/dice';
import { Queries, IElementObject, ElementParams, Variables, RollMode } from 'types/elements';
import { IFileMetadata } from 'types/database/files';
import CreatureData from 'data/structures/creature';
import styles from 'styles/elements.module.scss';

interface RollOptions extends Variables {
    dice?: string
    num?: string
    mod?: string
    mode?: RollMode
    desc?: string
    critRange?: string
    tooltips?: string
}

class Options implements Required<RollOptions> {
    protected readonly options: RollOptions

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

    public get critRange(): string {
        let val = "20";
        return this.options.critRange ?? val
    }

    public get critRangeValue(): number {
        let value = parseInt(this.critRange)
        return isNaN(value) || value < 1 ? 20 : value
    }

    public get mode(): RollMode {
        if (validModes.has(this.options.mode)) {
            return this.options.mode as RollMode
        }
        if (this.numValue == 0 || (this.numValue == 1 && this.diceValue.num == 20)) {
            return RollMode.Mod
        }
        return RollMode.Dice
    }

    public get desc(): string {
        return this.options.desc ?? "Rolled"
    }
    
    public get tooltips(): string {
        return this.options.tooltips ?? undefined
    }

    public get show(): boolean {
        return this.mode === RollMode.Dice 
            || this.mode === RollMode.DMG
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
const validOptions = new Set(['dice', 'num', 'mod', 'mode', 'desc', 'tooltips', 'critRange']);
const validateOptions = (options: RollOptions): Queries => {
    Object.keys(options).forEach((key) => {
        if (!validOptions.has(key))
            throw new ParseError(`Unexpected roll option: '${key}'`);
    });

    if (options.dice) {
        let num = parseInt(options.dice)
        if (isNaN(num))
            throw new ParseError(`Invalid roll option value. dice: '${options.dice}', must be an integer`);
    }

    if (options.num) {
        let num = parseInt(options.num)
        if (isNaN(num) || num <= 0)
            throw new ParseError(`Invalid roll option value. num: '${options.num}', must be an integer > 0`);
    }

    if (options.mod) {
        let num = parseInt(options.mod)
        if (isNaN(num))
            throw new ParseError(`Invalid roll option value. mod: '${options.mod}', must be an integer`);
    }

    if (options.mode) {
        if (!validModes.has(options.mode as RollMode))
            throw new ParseError(`Invalid roll option value. mode: '${options.mode}', valid values: ${Array(validModes).join(', ')}`);
    }

    if (options.critRange) {
        let num = parseInt(options.critRange)
        if (isNaN(num) || num < 1)
            throw new ParseError(`Invalid roll option value. critRange: '${options.critRange}', must be an integer equal or greater to 1`);
    }
    return {}
}

const RollElement = ({ children, options }: ElementParams<RollOptions>): JSX.Element => {
    const [_, dispatch] = useContext(Context);
    const rollOptions = new Options(options);

    const roll = (method: RollMethod) => {
        let collection = new DiceCollection(rollOptions.modValue, rollOptions.desc);
        collection.add(rollOptions.diceValue, rollOptions.numValue);
        dispatch.roll(collection, method, rollOptions.critRangeValue);
    }

    const handleContext: React.MouseEventHandler<HTMLSpanElement> = (e) => {
        e.preventDefault();
        e.stopPropagation();
        openContext(options.mode === RollMode.DMG 
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
            ], { x: e.pageX, y: e.pageY }, true);
    }

    function handleClick(e: React.MouseEvent<HTMLSpanElement, MouseEvent>) {
        e.preventDefault();
        e.stopPropagation();
        roll(RollMethod.Normal);
    }

    return (
        <span 
            className={styles.roll}
            onClick={handleClick}
            onContextMenu={handleContext}
            tooltips={options.tooltips}>
            {rollOptions.rollText}
            {children && <span>{children}</span> }
        </span>
    )
}

export const element = {
    roll: {
        type: 'roll',
        defaultKey: 'dice',
        buildChildren: true,
        validOptions: validOptions,
        toComponent: RollElement,
        validate: validateOptions
    }
} satisfies Record<string, IElementObject>

export default RollElement;
export type {
    RollOptions
}