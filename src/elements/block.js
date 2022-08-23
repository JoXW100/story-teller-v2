import styles from 'styles/elements/main.module.scss';
import { ParseError } from 'utils/parser';

const validOptions = ['weight', 'width'];
const validateOptions = (options) => {
    Object.keys(options).forEach((key) => {
        if (!validOptions.includes(key))
            throw new ParseError(`Unexpected align option: '${key}'`);
    });

    if (options.weight) {
        var weight = parseFloat(options.weight)
        if (isNaN(weight))
            throw new ParseError(`Invalid align option value. weight: '${options.mod}', must be a number`);
    }
}

/**
 * @param {{ options: Object.<string, string>, children: JSX.Element }} 
 * @returns {JSX.Element}
 */
const BlockElement = ({ options = {}, children }) => {
    const weight = parseFloat(options.weight ?? 1)
    const width = options.width ?? '100%';
    return (
        <div 
            style={{ flex: weight, maxWidth: width }}
            className={styles.block}
        > 
            {children} 
        </div>
    )
}

/**
 * @type {Object.<string, RenderElement>}
 */
 export const element = {
    'block': {
        type: 'block',
        defaultKey: 'width',
        validOptions: validOptions,
        toComponent: BlockElement,
        validateOptions: validateOptions
    }
}

export default BlockElement;