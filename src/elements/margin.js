import { useMemo } from 'react';
import { ParseError } from 'utils/parser';
import styles from 'styles/elements/main.module.scss';

const validOptions = ['margin'];
const validateOptions = (options) => {
    Object.keys(options).forEach((key) => {
        if (!validOptions.some((x) => x === key))
            throw new ParseError(`Unexpected margin option: '${key}'`);
    });
}

/**
 * @param {{ options: Object.<string, string>, children: JSX.Element }} 
 * @returns {JSX.Element}
 */
const Margin = ({ options = {}, children }) => {
    const margin = useMemo(() => {
        return options.margin ?? '5px'
    }, [options])

    return (
        <div className={styles.margin} style={{ margin: margin }}>
            { children?.filter((x) => !/^[\n\r ]*$/.test(x)) }
        </div>
    )
}

/**
 * @type {Object.<string, RenderElement>}
 */
export const element = {
    'margin': {
        type: 'margin',
        defaultKey: 'margin',
        validOptions: validOptions,
        toComponent: Margin,
        validateOptions: validateOptions
    }
}

export default Margin;