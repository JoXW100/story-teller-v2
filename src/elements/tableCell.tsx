import { ParseError } from 'utils/parser';
import { ElementObject, ElementParams, Queries, Variables } from 'types/elements';

interface TableCellOptions extends Variables {
    color?: string
}

class Options implements TableCellOptions {
    protected readonly options: TableCellOptions;
    [key: string]: any

    constructor(options: TableCellOptions) {
        this.options =  options ?? {}
    }

    public get color(): string {
        return this.options.color
    }
}

const validOptions = new Set(['color']);
const validateOptions = (options: TableCellOptions): Queries => {
    Object.keys(options).forEach((key) => {
        if (!validOptions.has(key))
            throw new ParseError(`Unexpected box option: '${key}'`);
    });
    return {}
}

const TableCellElement = ({ children, options }: ElementParams<TableCellOptions>): JSX.Element => {
    const optionsTableCell = new Options(options)
    const style: Record<string, string | number> = {}
    if (options.color) { style.background = optionsTableCell.color }
    return <td style={style}>{children}</td>
}

const _element: ElementObject = {
    type: 'tableCell',
    defaultKey: 'color',
    buildChildren: true,
    inline: true,
    lineBreak: true,
    container: false,
    toComponent: TableCellElement,
    validate: validateOptions
}

export const element: Record<string, ElementObject> = {
    tableCell: _element,
    tc: _element
}

export default TableCellElement;