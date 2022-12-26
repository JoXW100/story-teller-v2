import React from 'react';
import { ParseError } from 'utils/parser';
import type { Queries, ElementObject, ElementParams, Variables } from 'types/elements';
import styles from 'styles/elements.module.scss';

interface AlignOptions extends Variables {
    direction?: string
    weight?: string
}

const validDirections = new Set(['c', 'h', 'v']);
const validOptions = new Set(['direction', 'weight']);

const validateOptions = (options: Variables): Queries => {
    Object.keys(options).forEach((key) => {
        if (!validOptions.has(key))
            throw new ParseError(`Unexpected align option: '${key}'`);
    });

    if (options.direction) {
        var chars = options.direction.split('');
        var taken = Object.values(validDirections).reduce((prev, val) => ({ 
            ...prev, [val]: false 
        }), {})
        chars.forEach((key) => {
            if (!validDirections.has(key) || taken[key])
                throw new ParseError(`Invalid align option value. direction: '${options.direction}'`);
            taken[key] = true
        })
    }

    if (options.weight) {
        var weight = parseFloat(options.weight)
        if (isNaN(weight))
            throw new ParseError(`Invalid align option value. weight: '${options.mod}', must be a number`);
    }

    return {}
}

const AlignElement = ({ options = {}, children }: ElementParams<AlignOptions>): any => {
    const weight = parseFloat(options.weight ?? '1')
    options.direction = options.direction ?? 'h'

    return (
        <div
            className={styles.align} 
            style={{ flex: weight }}
            data={options.direction}
        >
            { children }
        </div>
    )
}

export const element: { [s: string]: ElementObject } = {
    align: {
        type: 'align',
        defaultKey: 'direction',
        validOptions: validOptions,
        toComponent: AlignElement,
        validate: validateOptions
    }
}

export default AlignElement;