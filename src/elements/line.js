import styles from 'styles/elements/main.module.scss';
import { ParseError } from 'utils/parser';

/**
 * @param {{ options: Object.<string, string>, children: JSX.Element }} 
 * @returns {JSX.Element}
 */
const LineElement = ({ options, children }) => {
    return (
        <div className={styles.line}/>
    )
}

/**
 * @type {Object.<string, RenderElement>}
 */
 export const element = {
    'line': {
        type: 'line',
        defaultKey: null,
        validOptions: [],
        toComponent: LineElement,
        validateOptions: (options) => {
            if (Object.keys(options).length > 0)
                throw new ParseError(`'line' command does not accept any options`);
        }
    }
}

export default LineElement;