import { ParseError } from 'utils/parser';
import { IElementObject, ElementParams, Queries, Variables } from 'types/elements';

interface TableCellOptions extends Variables {
    color?: string
}

class Options implements TableCellOptions {
    protected readonly options: TableCellOptions;

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

const _element = {
    type: 'tableCell',
    defaultKey: 'color',
    buildChildren: true,
    validOptions: validOptions,
    toComponent: TableCellElement,
    validate: validateOptions
} satisfies IElementObject

export const element = {
    tableCell: _element,
    tc: _element
} satisfies Record<string, IElementObject>

export default TableCellElement;