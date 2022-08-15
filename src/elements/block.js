import styles from 'styles/elements/main.module.scss';
import { ParseError } from 'utils/parser';

/**
 * @param {{ options: Object.<string, string>, children: JSX.Element }} 
 * @returns {JSX.Element}
 */
const BlockElement = ({ options, children }) => {
    return <div className={styles.block}> {children} </div>
}

/**
 * @type {Object.<string, RenderElement>}
 */
 export const element = {
    'block': {
        type: 'block',
        defaultKey: null,
        validOptions: [],
        toComponent: BlockElement,
        validateOptions: (options) => {
            if (Object.keys(options).length > 0)
                throw new ParseError(`'bold' command does not accept any options`);
        }
    }
}

export default BlockElement;