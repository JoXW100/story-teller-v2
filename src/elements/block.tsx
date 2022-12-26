import { ParseError } from 'utils/parser';
import type { Queries, ElementObject, ElementParams, Variables } from 'types/elements';
import styles from 'styles/elements/main.module.scss';

interface BlockOptions extends Variables {
    weight?: string
    width?: string
}

const validOptions = new Set(['weight', 'width']);
const validateOptions = (options: Variables): Queries => {
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
    const weight = parseFloat(options.weight ?? '1')
    const width = options.width ?? '100%';
    return (
        <div 
            style={{ flex: weight, maxWidth: width }}
            className={styles.block}
        > 
            {children} 
        </div>
    )
}

export const element: { [s: string]: ElementObject } = {
    block: {
        type: 'block',
        defaultKey: 'width',
        validOptions: validOptions,
        toComponent: BlockElement,
        validate: validateOptions
    }
}

export default BlockElement;