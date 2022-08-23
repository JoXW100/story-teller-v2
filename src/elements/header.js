import { ParseError } from 'utils/parser';
import styles from 'styles/elements/header.module.scss';

const validOptions = ['underline'];
const validateOptions = (options) => {
    Object.keys(options).forEach((key) => {
        if (!validOptions.some((x) => x === key))
            throw new ParseError(`Unexpected header option: '${key}'`);
    });
}


/**
 * @param {{ options: Object.<string, string>, children: JSX.Element }} 
 * @returns {JSX.Element}
 */
export const Header1 = ({ options, children }) => {
    return (
        <div className={styles.header1} underline={options?.underline ?? "false"}>
            { children }
        </div>
    )
}

/**
 * @param {{ options: Object.<string, string>, children: JSX.Element }} 
 * @returns {JSX.Element}
 */
export const Header2 = ({ options, children }) => {
    return (
        <div className={styles.header2} underline={options?.underline ?? "false"}>
            { children }
        </div>
    )
}

/**
 * @param {{ options: Object.<string, string>, children: JSX.Element }} 
 * @returns {JSX.Element}
 */
export const Header3 = ({ options, children }) => {
    return (
        <div className={styles.header3} underline={options?.underline ?? "false"}>
            { children }
        </div>
    )
}

/**
 * @type {Object.<string, RenderElement>}
 */
export const element = {
    'h1': {
        type: 'header',
        defaultKey: 'underline',
        validOptions: validOptions,
        toComponent: Header1,
        validateOptions: validateOptions
    },
    'h2': {
        type: 'header',
        defaultKey: 'underline',
        validOptions: validOptions,
        toComponent: Header2,
        validateOptions: validateOptions
    },
    'h3': {
        type: 'header',
        defaultKey: 'underline',
        validOptions: validOptions,
        toComponent: Header3,
        validateOptions: validateOptions
    }
}