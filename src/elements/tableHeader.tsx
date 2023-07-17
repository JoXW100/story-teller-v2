import { ParseError } from 'utils/parser';
import { Queries, ElementObject, ElementParams, Variables } from 'types/elements';

interface TableHeaderOptions extends Variables {
    width?: string
}

class Options implements TableHeaderOptions {
    protected readonly options: TableHeaderOptions;
    [key: string]: any

    constructor(options: TableHeaderOptions) {
        this.options =  options ?? {}
    }

    public get width(): string {
        return this.options.width ?? 'auto'
    }

    public get color(): string {
        return this.options.color
    }
}

const validOptions = new Set(['color', 'width']);
const validateOptions = (options: TableHeaderOptions): Queries => {
    Object.keys(options).forEach((key) => {
        if (!validOptions.has(key))
            throw new ParseError(`Unexpected box option: '${key}'`);
    });
    return {}
}

const TableHeaderElement = ({ options = {}, children }: ElementParams<TableHeaderOptions>): JSX.Element => {
    const optionsTableHeader = new Options(options)
    const style: Record<string, string | number> = { width: optionsTableHeader.width }
    if (options.color) { style.background = optionsTableHeader.color }
    return <th style={style}>{children}</th>
}

const _element: ElementObject = {
    type: 'tableHeader',
    defaultKey: 'color',
    buildChildren: true,
    inline: true,
    lineBreak: true,
    container: false,
    toComponent: TableHeaderElement,
    validate: validateOptions
}

export const element: Record<string, ElementObject> = {
    tableHeader: _element,
    th: _element
}

export default TableHeaderElement;