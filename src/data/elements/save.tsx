import styles from 'styles/elements.module.scss';
import { OptionalAttribute } from 'types/database/dnd';
import { Queries, IElementObject, ElementParams, Variables } from 'types/elements';
import { ParseError } from 'utils/parser';

interface SaveOptions extends Variables {
    dc?: string
    value?: string
    attr?: string
    type?: string
    tooltips?: string
}

class Options implements SaveOptions {
    protected readonly options: SaveOptions;
    [key: string]: any

    constructor(options: SaveOptions) {
        this.options =  options ?? {}
    }

    public get dc(): string {
        return this.options.dc ?? this.options.value ?? "0"
    }

    public get value(): string {
        return this.options.value ?? this.options.dc ?? "0"
    }

    public get attr(): string {
        return this.options.attr ?? this.options.type ?? OptionalAttribute.None
    }

    public get type(): string {
        return this.options.type ?? this.options.attr ?? OptionalAttribute.None
    }

    public get typeText(): string {
        return this.type == OptionalAttribute.None 
            ? ""
            : this.type.toLocaleUpperCase()
    }

    public get tooltips(): string {
        return this.options.tooltips ?? undefined
    }
}

const validOptions = new Set(['dc', 'value', 'attr', 'type', 'tooltips']);

const validateOptions = (options: SaveOptions): Queries => {
    Object.keys(options).forEach((key) => {
        if (!validOptions.has(key))
            throw new ParseError(`Unexpected save option: '${key}'`);
    })

    if (options.dc ?? options.value) {
        let num = parseInt(options.dc ?? options.value)
        if (isNaN(num) || num < 0)
            throw new ParseError(`Invalid save dc: '${options.dc ?? options.value}', must be a number >= 0`);
    }
    return {}
}

const SaveElement = ({ options = {} }: ElementParams<SaveOptions>): JSX.Element => {
    const saveOptions = new Options(options)
    return (
        <span 
            className={styles.save}
            tooltips={saveOptions.tooltips}> 
            {`DC:${saveOptions.dc} ${saveOptions.typeText}`} 
        </span>
    )
}

const _element = {
    type: 'save',
    defaultKey: 'dc',
    buildChildren: false,
    validOptions: validOptions,
    toComponent: SaveElement,
    validate: validateOptions
} satisfies IElementObject

export const element = {
    save: _element,
    check: _element
} satisfies Record<string, IElementObject>

export default SaveElement;