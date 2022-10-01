import { ParseError } from "utils/parser";
import styles from 'styles/elements/main.module.scss';

/**
 * @param {{ options: Object.<string, string>, children: JSX.Element }} 
 * @returns {JSX.Element}
 */
 const RowElement = ({ children }) => {
    return <div className={styles.row}> { children } </div>
}

/**
 * @type {Object.<string, RenderElement>}
 */
 export const element = {
    'row': {
        type: 'row',
        defaultKey: null,
        validOptions: [],
        toComponent: RowElement,
        validateOptions: (options) => {
            if (Object.keys(options).length > 0)
                throw new ParseError(`'row' command does not accept any options`);
        }
    }
}

export default RowElement;