import { useMemo } from 'react';
import { ParseError } from 'utils/parser';
import { Queries, ElementObject, ElementParams, Variables } from 'types/elements';
import styles from 'styles/elements.module.scss';

interface MarginOptions extends Variables {
    fileId?: string
    border?: string
}

const validOptions = new Set(['margin']);
const validateOptions = (options: Variables): Queries => {
    Object.keys(options).forEach((key) => {
        if (!validOptions.has(key))
            throw new ParseError(`Unexpected margin option: '${key}'`);
    });
    return {}
}

const Margin = ({ options = {}, children }: ElementParams<MarginOptions>): JSX.Element => {
    const margin = useMemo(() => {
        return options.margin ?? '5px'
    }, [options])

    return (
        <div className={styles.margin} style={{ margin: margin }}>
            { children }
        </div>
    )
}

export const element: { [s: string]: ElementObject; } = {
    'margin': {
        type: 'margin',
        defaultKey: 'margin',
        validOptions: validOptions,
        toComponent: Margin,
        validate: validateOptions
    }
}

export default Margin;