import { ParseError } from 'utils/parser';
import { Queries, ElementObject, ElementParams, Variables } from 'types/elements';
import styles from 'styles/elements.module.scss';

interface MarginOptions extends Variables {
    margin?: string
}

class Options implements MarginOptions {
    protected readonly options: MarginOptions;
    [key: string]: any

    constructor(options: MarginOptions) {
        this.options =  options ?? {}
    }

    public get margin(): string {
        return this.options.margin ?? "5px"
    }
}

const validOptions = new Set(['margin']);
const validateOptions = (options: MarginOptions): Queries => {
    Object.keys(options).forEach((key) => {
        if (!validOptions.has(key))
            throw new ParseError(`Unexpected margin option: '${key}'`);
    });
    return {}
}

const Margin = ({ options = {}, children }: ElementParams<MarginOptions>): JSX.Element => {
    const marginOptions = new Options(options)
    return (
        <div className={styles.margin} style={{ margin: marginOptions.margin }}>
            { children }
        </div>
    )
}

export const element: Record<string, ElementObject> = {
    'margin': {
        type: 'margin',
        defaultKey: 'margin',
        buildChildren: true,
        inline: false,
        lineBreak: true,
        container: true,
        toComponent: Margin,
        validate: validateOptions
    }
}

export default Margin;