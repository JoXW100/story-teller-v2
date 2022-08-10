import { ParseError } from 'utils/parser';
import styles from 'styles/elements/main.module.scss';

const validDirections = ['horizontal', 'vertical', 'h', 'v'];
const validOptions = ['direction'];
const validateOptions = (options) => {
    Object.keys(options).forEach((key) => {
        if (!validOptions.includes(key))
            throw new ParseError(`Unexpected align option: '${key}'`);
    });

    if (options.direction && !validDirections.includes(options.direction))
        throw new ParseError(`Invalid align direction: '${options.direction}'`);
}

/**
 * @param {{ options: Object.<string, string>, children: JSX.Element }} 
 * @returns {JSX.Element}
 */
const AlignElement = ({ options, children }) => {
    return (
        <div 
            className={styles.align} 
            vertical={['v', 'vertical'].includes(options.vertical) ? true : undefined}
        >
            { children }
        </div>
    )
}

/**
 * @type {Object.<string, RenderElement>}
 */
 export const element = {
    'align': {
        type: 'align',
        defaultKey: 'direction',
        validOptions: validOptions,
        toComponent: AlignElement,
        validateOptions: validateOptions
    }
}

export default AlignElement;