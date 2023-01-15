import { ParseError } from 'utils/parser';
import type { Queries, ElementObject, ElementParams, Variables } from 'types/elements';
import styles from 'styles/elements.module.scss';

interface BlockOptions extends Variables {
    weight?: string
    width?: string
}

class Options implements BlockOptions {
    protected readonly options: BlockOptions;
    [key: string]: any

    constructor(options: BlockOptions) {
        this.options =  options ?? {}
    }

    public get weight(): string {
        return this.options.weight ?? '1'
    }

    public get weightValue(): number {
        let value = parseFloat(this.weight)
        return isNaN(value) ? 1 : value
    }

    public get width(): string {
        return this.options.width ?? '100%'
    }
}

const validOptions = new Set(['weight', 'width']);
const validateOptions = (options: BlockOptions): Queries => {
    Object.keys(options).forEach((key) => {
        if (!validOptions.has(key))
            throw new ParseError(`Unexpected align option: '${key}'`);
    });

    if (options.weight) {
        var weight = parseFloat(options.weight)
        if (isNaN(weight))
            throw new ParseError(`Invalid align option value. weight: '${options.mod}', must be a number`);
    }

    return {}
}

const BlockElement = ({ options = {}, children }: ElementParams<BlockOptions>): JSX.Element => {
    const blockOption = new Options(options)
    return (
        <div 
            style={{ flex: blockOption.weightValue, maxWidth: blockOption.width }}
            className={styles.block}
        > 
            {children} 
        </div>
    )
}

export const element: Record<string, ElementObject> = {
    block: {
        type: 'block',
        defaultKey: 'width',
        toComponent: BlockElement,
        validate: validateOptions
    }
}

export default BlockElement;