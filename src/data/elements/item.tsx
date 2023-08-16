import { ParseError } from 'utils/parser';
import type { IElementObject, ElementParams, Variables, Queries } from 'types/elements';
import styles from 'styles/elements.module.scss';

interface ItemOptions extends Variables {
    dot?: string
}

const Dots = ['*', '-', '0']

class Options implements ItemOptions {
    protected readonly options: ItemOptions;

    constructor(options: ItemOptions) {
        this.options =  options ?? {}
    }

    public get dot(): string {
        return Dots.includes(this.options.dot)
            ? this.options.dot 
            : Dots[0]
    }
}

const validOptions = new Set(['dot']);
const validateOptions = (options: ItemOptions): Queries => {
    Object.keys(options).forEach((key) => {
        if (!validOptions.has(key))
            throw new ParseError(`Unexpected align option: '${key}'`);
    });

    if (options.dot && !Dots.includes(options.dot)) {
        throw new ParseError(`Invalid align option value. dot: '${options.dot}', must be a one of: ${Dots.join(', ')}.`);
    }
    return {}
}

const ItemElement = ({ options, children }: ElementParams<ItemOptions>): JSX.Element => {
    const itemOptions = new Options(options);
    return (
        <div className={styles.item} data={itemOptions.dot}>
            {children}
        </div>
    )
}

export const element = {
    item: {
        type: 'item',
        defaultKey: 'dot',
        buildChildren: true,
        validOptions: validOptions,
        toComponent: ItemElement,
        validate: validateOptions
    } 
} satisfies Record<string, IElementObject>

export default ItemElement;