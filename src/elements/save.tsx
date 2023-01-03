import styles from 'styles/elements.module.scss';
import { Queries, ElementObject, ElementParams, Variables } from 'types/elements';
import { ParseError } from 'utils/parser';

interface SaveOptions extends Variables {
    value?: string
    attr?: string
    tooltips?: string
}

const validOptions = new Set(['dc', 'attr', 'type', 'tooltips']);

const validateOptions = (options: Variables): Queries => {
    Object.keys(options).forEach((key) => {
        if (!validOptions.has(key))
            throw new ParseError(`Unexpected save option: '${key}'`);
    })

    if (options.dc) {
        var num = parseInt(options.dc)
        if (isNaN(num) || num < 0)
            throw new ParseError(`Invalid save dc: '${options.dc}', must be a number >= 0`);
    }
    return {}
}

const SaveElement = ({ options = {} }: ElementParams<SaveOptions>): JSX.Element => {
    const dc = options.dc ?? '0';
    const attr = (options.attr ?? options.type ?? 'NONE').toUpperCase();
    return (
        <span 
            className={styles.save}
            tooltips={options.tooltips}
        > 
            {`DC:${dc} ${attr}`} 
        </span>
    )
}

export const element: { [s: string]: ElementObject; } = {
    'save': {
        type: 'save',
        defaultKey: 'dc',
        validOptions: validOptions,
        toComponent: SaveElement,
        validate: validateOptions
    }
}

export default SaveElement;