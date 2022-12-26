import React from 'react';
import { ParseError } from 'utils/parser';
import type { Queries, ElementObject, ElementParams, Variables } from 'types/elements';
import styles from 'styles/elements/main.module.scss';

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
        chars.forEach((key) => {
            if (!validDirections.has(key))
                throw new ParseError(`Invalid align option value. direction: '${options.direction}'`);
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
    const vertical = options.direction?.includes('v');
    const center = options.direction?.includes('c')
    const weight = parseFloat(options.weight ?? '1')

    return (
        <div
            className={styles.align} 
            style={{ flex: weight }}
            // @ts-ignore
            direction={vertical ? "V" : "H"}
            center={center ? "C" : undefined}
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