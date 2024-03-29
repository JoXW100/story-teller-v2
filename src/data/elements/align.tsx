import React from 'react';
import { ParseError } from 'utils/parser';
import { Queries, IElementObject, ElementParams, Variables, AlignDirection } from 'types/elements';
import styles from 'styles/elements.module.scss';

interface AlignOptions extends Variables {
    direction?: string
    weight?: string
}

class Options implements AlignOptions {
    protected readonly options: AlignOptions;

    constructor(options: AlignOptions) {
        this.options =  options ?? {}
    }

    public get direction(): string {
        return this.options.direction ?? AlignDirection.Horizontal
    }

    public get weight(): string {
        return this.options.weight ?? '1'
    }

    public get weightValue(): number {
        let value = parseFloat(this.weight)
        return isNaN(value) ? 1 : value
    }
}

const validDirections = new Set(Object.values(AlignDirection));
const validOptions = new Set(['direction', 'weight']);

const validateOptions = (options: AlignOptions): Queries => {
    Object.keys(options).forEach((key) => {
        if (!validOptions.has(key))
            throw new ParseError(`Unexpected align option: '${key}'`);
    });

    if (options.direction) {
        let chars = options.direction.split('');
        let taken = Object.values(validDirections).reduce((prev, val) => ({ 
            ...prev, [val]: false 
        }), {})
        chars.forEach((key) => {
            if (!validDirections.has(key as AlignDirection) || taken[key])
                throw new ParseError(`Invalid align option value. direction: '${options.direction}'`);
            taken[key] = true
        })
    }

    if (options.weight) {
        let weight = parseFloat(options.weight)
        if (isNaN(weight))
            throw new ParseError(`Invalid align option value. weight: '${options.weight}', must be a number`);
    }

    return {}
}

const AlignElement = ({ options = {}, children }: ElementParams<AlignOptions>): any => {
    const alignOptions = new Options(options)
    return (
        <div
            className={styles.align} 
            style={{ flex: alignOptions.weightValue }}
            data={alignOptions.direction}>
            { children }
        </div>
    )
}

export const element = {
    align: {
        type: 'align',
        defaultKey: 'direction',
        buildChildren: true,
        validOptions: validOptions,
        toComponent: AlignElement,
        validate: validateOptions
    }
} satisfies Record<string, IElementObject>

export default AlignElement;