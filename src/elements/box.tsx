import { ParseError } from 'utils/parser';
import { Queries, ElementObject, ElementParams, Variables } from 'types/elements';
import styles from 'styles/elements.module.scss';

interface BoxOptions extends Variables {
    color?: string
    border?: string
    width?: string
    weight?: string
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

    public get width(): string {
        return this.options.width ?? '100%'
    }

    public get weight(): string {
        return this.options.weight ?? '1'
    }

    public get weightValue(): number {
        let value = parseFloat(this.weight)
        return isNaN(value) ? 1 : value
    }
}

const validOptions = new Set(['color', 'border', 'width', 'weight']);
const validateOptions = (options: BoxOptions): Queries => {
    Object.keys(options).forEach((key) => {
        if (!validOptions.has(key))
            throw new ParseError(`Unexpected box option: '${key}'`);
    });
    

    if (options.weight) {
        var weight = parseFloat(options.weight)
        if (isNaN(weight))
            throw new ParseError(`Invalid box option value. weight: '${options.mod}', must be a number`);
    }

    return {}
}

const BoxElement = ({ options = {}, children }: ElementParams<BoxOptions>): JSX.Element => {
    const optionsBox = new Options(options)
    const style = { maxWidth: optionsBox.width } as Record<string, string | number>
    if (options.weight) { style.flex = optionsBox.weightValue }
    if (options.color) { style.background = optionsBox.color }
    return (
        <div 
            className={styles.box}
            data={optionsBox.border}
            style={style}>
            { children }
        </div>
    )
}

export const element: Record<string, ElementObject> = {
    box: {
        type: 'box',
        defaultKey: 'color',
        inline: false,
        lineBreak: true,
        container: true,
        toComponent: BoxElement,
        validate: validateOptions
    }
}

export default BoxElement;