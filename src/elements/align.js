import { ParseError } from 'utils/parser';
import styles from 'styles/elements/main.module.scss';

const validDirections = ['c', 'h', 'v'];
const validOptions = ['direction', 'weight'];
const validateOptions = (options) => {
    Object.keys(options).forEach((key) => {
        if (!validOptions.includes(key))
            throw new ParseError(`Unexpected align option: '${key}'`);
    });

    if (options.direction) {
        var chars = options.direction.split('');
        chars.forEach((c) => {
            if (!validDirections.includes(c))
                throw new ParseError(`Invalid align option value. direction: '${options.direction}'`);
        })
    }

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
const AlignElement = ({ options = {}, children }) => {
    const vertical = options.direction?.includes('v');
    const center = options.direction?.includes('c')
    const weight = parseFloat(options.weight ?? 1)

    return (
        <div 
            className={styles.align} 
            direction={vertical ? "V" : "H"}
            center={center ? "C" : undefined}
            style={{ flex: weight }}
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