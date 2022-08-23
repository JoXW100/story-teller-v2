import styles from 'styles/elements/main.module.scss';
import { ParseError } from 'utils/parser';

const validOptions = ['value', 'attr', 'tooltips'];

const validateOptions = (options) => {
    Object.keys(options).forEach((key) => {
        if (!validOptions.some((x) => x === key))
            throw new ParseError(`Unexpected save option: '${key}'`);
    })

    if (options.value) {
        var num = parseInt(options.value)
        if (isNaN(num) || num < 0)
            throw new ParseError(`Invalid save value: '${options.value}', must be a number > 0`);
    }
    
}

/**
 * @param {{ options: Object.<string, string>, children: JSX.Element }} 
 * @returns {JSX.Element}
 */
const SaveElement = ({ options }) => {
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

/**
 * @type {Object.<string, RenderElement>}
 */
export const element = {
    'save': {
        type: 'save',
        defaultKey: 'value',
        validOptions: validOptions,
        toComponent: SaveElement,
        validateOptions: validateOptions
    }
}

export default SaveElement;