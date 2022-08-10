import { useMemo } from 'react';
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
    const style = useMemo(() => {
        return options.underline == 'true' 
            ? `${styles.header1} ${styles.underline}`
            : styles.header1
    }, [options])

    return (
        <div className={style}>
            { children }
        </div>
    )
}

/**
 * @param {{ options: Object.<string, string>, children: JSX.Element }} 
 * @returns {JSX.Element}
 */
export const Header2 = ({ options, children }) => {
    const style = useMemo(() => {
        return options.underline == 'true' 
            ? `${styles.header2} ${styles.underline}`
            : styles.header2
    }, [options])

    return (
        <div className={style}>
            { children }
        </div>
    )
}

/**
 * @param {{ options: Object.<string, string>, children: JSX.Element }} 
 * @returns {JSX.Element}
 */
export const Header3 = ({ options, children }) => {
    const style = useMemo(() => {
        return options.underline == 'true' 
            ? `${styles.header3} ${styles.underline}`
            : styles.header3
    }, [options])

    return (
        <div className={style}>
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