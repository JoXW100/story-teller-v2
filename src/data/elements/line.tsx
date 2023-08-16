import { ParseError } from 'utils/parser';
import { IElementObject, ElementParams, Queries, Variables } from 'types/elements';
import styles from 'styles/elements.module.scss';

interface LineOptions extends Variables {
    width?: string
}

class Options implements LineOptions {
    protected readonly options: LineOptions;

    constructor(options: LineOptions) {
        this.options =  options ?? {}
    }

    public get width(): string {
        return this.options.width ?? '2px'
    }
}

const validOptions = new Set(['width']);
const validateOptions = (options: LineOptions): Queries => {
    Object.keys(options).forEach((key) => {
        if (!validOptions.has(key))
            throw new ParseError(`Unexpected box option: '${key}'`);
    });

    return {}
}

const LineElement = ({ options = {} }: ElementParams<LineOptions>): JSX.Element => {
    const optionsLine = new Options(options)
    const style = { borderWidth: optionsLine.width }
    return (
        <div className={styles.line} style={style}/>
    )
}

export const element = {
    line: {
        type: 'line',
        defaultKey: 'width',
        buildChildren: false,
        validOptions: validOptions,
        toComponent: LineElement,
        validate: validateOptions
    }
} satisfies Record<string, IElementObject>

export default LineElement;