import styles from 'styles/elements.module.scss';
import { Queries, ElementObject, ElementParams, Variables } from 'types/elements';
import { ParseError } from 'utils/parser';

interface SaveOptions extends Variables {
    value?: string
    attr?: string
    tooltips?: string
}

const validOptions = new Set(['value', 'attr', 'tooltips']);

const validateOptions = (options: Variables): Queries => {
    Object.keys(options).forEach((key) => {
        if (!validOptions.has(key))
            throw new ParseError(`Unexpected save option: '${key}'`);
    })

    if (options.value) {
        var num = parseInt(options.value)
        if (isNaN(num) || num < 0)
            throw new ParseError(`Invalid save value: '${options.value}', must be a number > 0`);
    }
    return {}
}

const SaveElement = ({ options = {} }: ElementParams<SaveOptions>): JSX.Element => {
    const value = options.value ?? '0';
    const attr = (options.attr ?? 'NONE').toUpperCase();
    return (
        <span 
            className={styles.save}
            tooltips={options.tooltips}
        > 
            {`DC:${value} ${attr}`} 
        </span>
    )
}

export const element: { [s: string]: ElementObject; } = {
    'save': {
        type: 'save',
        defaultKey: 'value',
        validOptions: validOptions,
        toComponent: SaveElement,
        validate: validateOptions
    }
}

export default SaveElement;