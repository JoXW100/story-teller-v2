import { ParseError } from 'utils/parser';
import styles from 'styles/elements/main.module.scss';

const validOptions = ['color'];
const validateOptions = (options) => {
    Object.keys(options).forEach((key) => {
        if (!validOptions.some((x) => x === key))
            throw new ParseError(`Unexpected box option: '${key}'`);
    });
}

/**
 * @param {{ options: Object.<string, string>, children: JSX.Element }} 
 * @returns {JSX.Element}
 */
const BoxElement = ({ options = {}, children }) => {
    return (
        <div 
            style={options.color ? { background: options.color } : undefined}
            className={styles.box}
        >
            { children }
        </div>
    )
}

/**
 * @type {Object.<string, RenderElement>}
 */
 export const element = {
    'box': {
        type: 'box',
        defaultKey: 'color',
        validOptions: validOptions,
        toComponent: BoxElement,
        validateOptions: validateOptions
    }
}

export default BoxElement;