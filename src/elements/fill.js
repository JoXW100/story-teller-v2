import { ParseError } from 'utils/parser';
import styles from 'styles/elements/main.module.scss';

/**
 * @param {{ options: Object.<string, string>, children: JSX.Element }} 
 * @returns {JSX.Element}
 */
const FillElement = ({ options, children }) => {
    return (
        <div className={styles.fill}> {children} </div>
    )
}

/**
 * @type {Object.<string, RenderElement>}
 */
export const element = {
    'fill': {
        type: 'fill',
        defaultKey: null,
        validOptions: [],
        toComponent: FillElement,
        validateOptions: (options) => {
            if (Object.keys(options).length > 0)
                throw new ParseError(`'fill' command does not accept any options`);
        }
    }
}

export default FillElement;