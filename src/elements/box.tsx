import { ParseError } from 'utils/parser';
import { Queries, ElementObject, ElementParams, Variables } from 'types/elements';
import styles from 'styles/elements.module.scss';

interface BoxOptions extends Variables {
    color?: string
    border?: string
}

class Options implements BoxOptions {
    protected readonly options: BoxOptions;
    [key: string]: any

    constructor(options: BoxOptions) {
        this.options =  options ?? {}
    }

    public get color(): string {
        return this.options.color ?? null
    }

    public get border(): string {
        return this.options.border == "true" 
            ? 'true'
            : 'false'
    }
}

const validOptions = new Set(['color', 'border']);
const validateOptions = (options: BoxOptions): Queries => {
    Object.keys(options).forEach((key) => {
        if (!validOptions.has(key))
            throw new ParseError(`Unexpected box option: '${key}'`);
    });
    return {}
}

const BoxElement = ({ options = {}, children }: ElementParams<BoxOptions>): JSX.Element => {
    const optionsBox = new Options(options)
    return (
        <div 
            className={styles.box}
            style={options.color ? { background: optionsBox.color } : undefined}
            data={optionsBox.border}
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