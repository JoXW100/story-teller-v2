import styles from 'styles/elements/main.module.scss';
import { ParseError } from 'utils/parser';

/**
 * @param {{ options: Object.<string, string>, children: JSX.Element }} 
 * @returns {JSX.Element}
 */
const CenterElement = ({ options, children }) => {
    return (
        <div className={styles.center}>
            { children }
        </div>
    )
}

/**
 * @type {Object.<string, RenderElement>}
 */
 export const element = {
    'center': {
        type: 'center',
        defaultKey: null,
        validOptions: [],
        toComponent: CenterElement,
        validateOptions: (options) => {
            if (Object.keys(options).length > 0)
                throw new ParseError(`'center' command does not accept any options`);
        }
    }
}

export default CenterElement;