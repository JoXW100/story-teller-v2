import { ParseError } from 'utils/parser';
import { Queries, ElementObject, ElementParams, Variables } from 'types/elements';
import styles from 'styles/elements.module.scss';

interface BoxOptions extends Variables {
    color?: string
    border?: string
}

const validOptions = new Set(['color', 'border']);
const validateOptions = (options: Variables): Queries => {
    Object.keys(options).forEach((key) => {
        if (!validOptions.has(key))
            throw new ParseError(`Unexpected box option: '${key}'`);
    });
    return {}
}

const BoxElement = ({ options = {}, children }: ElementParams<BoxOptions>): JSX.Element => {
    const border = options.border ?? "true";
    return (
        <div 
            className={styles.box}
            style={options.color ? { background: options.color } : undefined}
            data={border}
        >
            { children }
        </div>
    )
}

export const element: { [key: string]: ElementObject; } = {
    box: {
        type: 'box',
        defaultKey: 'color',
        validOptions: validOptions,
        toComponent: BoxElement,
        validate: validateOptions
    }
}

export default BoxElement;