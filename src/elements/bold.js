import styles from 'styles/elements/main.module.scss';

/**
 * @param {{ options: Object.<string, string>, children: JSX.Element }} 
 * @returns {JSX.Element}
 */
 const BoldElement = ({ options, children }) => {
    return <b className={styles.bold}> {children} </b>
}

const x = {
    type: 'bold',
    defaultKey: null,
    validOptions: [],
    toComponent: BoldElement,
    validateOptions: (options) => {
        if (Object.keys(options).length > 0)
            throw new ParseError(`'bold' command does not accept any options`);
    }
}

/**
 * @type {Object.<string, RenderElement>}
 */
 export const element = {
    'b': x,
    'bold': x
}

export default BoldElement;