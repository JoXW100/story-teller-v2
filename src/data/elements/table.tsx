import Parser, { ParseError } from 'utils/parser';
import { element as cell } from './tableCell';
import { element as header } from './tableHeader';
import Logger from "utils/logger";
import { Queries, IElementObject, ElementParams, Variables, IParserObject } from 'types/elements';
import { IFileMetadata } from 'types/database/files';
import styles from 'styles/elements.module.scss';

interface TableOptions extends Variables {
    color?: string
    border?: string
    width?: string
    weight?: string
}

type TableItems = { headers: JSX.Element[], cells: JSX.Element[] };

class Options implements TableOptions {
    protected readonly options: TableOptions;
    [key: string]: any

    constructor(options: TableOptions) {
        this.options =  options ?? {}
    }

    public get color(): string {
        return this.options.color ?? null
    }

    public get border(): string {
        return this.options.border == "false" 
            ? 'false'
            : 'true'
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
const validHeaders = new Set(Object.keys(header));
const validCells = new Set(Object.keys(cell));
const validContent = new Set([null, 'text', ...Object.keys(header), ...Object.keys(cell)]);
const validate = (options: TableOptions, content: IParserObject[]): Queries => {
    Object.keys(options).forEach((key) => {
        if (!validOptions.has(key))
            throw new ParseError(`Unexpected box option: '${key}'`);
    });

    if (options.weight) {
        let weight = parseFloat(options.weight)
        if (isNaN(weight))
            throw new ParseError(`Invalid box option value. weight: '${options.weight}', must be a number`);
    }

    let errorElement = content.find((element) => !validContent.has(element?.type));
    if (errorElement) {
        Logger.error("elements.Table", errorElement);
        throw new ParseError(`Table cannot contain elements of type: '${errorElement.type}'`);
    }

    return {}
}

const GetTableItems = (content: IParserObject[], metadata: IFileMetadata, key: string): TableItems => {
    return content.reduce((items, element, index) => {
        switch (true) {
            case validHeaders.has(element?.type):
                return { 
                    ...items,
                    headers: [...items.headers, Parser.buildComponent(element, key, index, metadata)] 
                }
            case validCells.has(element?.type):
                return { 
                    ...items,
                    cells: [...items.cells, Parser.buildComponent(element, key, index, metadata)] 
                }
            case element == null:
            case element?.type == 'text':
                return items;
            default:
                throw new ParseError(`Table cannot contain elements of type: '${element.type}'`);
        }
    }, { headers: [], cells: [] } as TableItems)
}

const TableElement = ({ options = {}, content, metadata, variablesKey }: ElementParams<TableOptions>): JSX.Element => {
    const optionsTable = new Options(options)
    const style = { maxWidth: optionsTable.width } as Record<string, string | number>
    const { headers, cells } = GetTableItems(content, metadata, variablesKey);
    const columns = headers.length;
    const rows = cells.reduce((rows, cell, index) => {
        let i = index % columns;
        let j = Math.floor(index / columns);
        if (!rows[j]) rows[j] = [];
        rows[j][i] = cell;
        return rows;
    }, [] as JSX.Element[][])

    if (options.weight) { style.flex = optionsTable.weightValue }
    if (options.color) { style.background = optionsTable.color }
    return (
        <table 
            className={styles.table}
            data={optionsTable.border}
            style={style}>
            { headers.length > 0 &&
                <thead>
                    <tr>{headers}</tr>
                </thead>
            }
            { rows.length > 0 &&
                <tbody>
                    { rows.map((row, key) => <tr key={key}>{row}</tr>)}
                </tbody>
            }
        </table>
    )
}

export const element = {
    table: {
        type: 'table',
        defaultKey: 'color',
        buildChildren: false,
        validOptions: validOptions,
        toComponent: TableElement,
        validate: validate
    }
} satisfies Record<string, IElementObject>

export default TableElement;