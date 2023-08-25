import React, { useEffect, useState } from "react";
import Communication from "./communication";
import { arrayUnique, isEnum, isNumber, isObjectId } from "./helpers";
import { ElementDictionary, TableElementTypes, getElement } from "data/elements";
import { Variables, Queries, IParserMetadata, QueryCollection, IParserObject, IParserOption } from "types/elements";
import styles from 'styles/renderer.module.scss';
import { ObjectId } from "types/database";
import FileData from "data/structures/file";

export class ParseError extends Error {
    constructor(message: string) {
        super(`Parse error: ${message}`);
    }
}

enum CalcOperation {
    None = 'none',
    Value = 'value',
    Add = '+',
    Subtract = '-',
    Multiply = '*',
    DivideDown = '>/',
    DivideUp = '</'
}
const OperationsOrder: CalcOperation[] = [CalcOperation.Multiply, CalcOperation.DivideDown, CalcOperation.DivideUp, CalcOperation.Subtract, CalcOperation.Add]

abstract class Parser
{
    public static readonly matchVarsExpr = /\$([a-z0-9]+)/gi
    public static readonly matchCalcExpr = /\$\{([^\}]*)\}/g
    public static readonly splitCalcExpr = / *(-(?![0-9]+)|\+|\*|\<\/|\>\/) */g
    public static readonly matchBodyExpr = /([\{\}])/
    public static readonly matchOptionsExpr = /,? *(?:([a-z0-9]+):(?!\/) *)?([^\n\r,]+ *)/gi
    public static readonly splitFunctionExpr = /(\\[0-9a-z]+[\n\r]*(?: *\[[ \n\r]*[^\]\n\r]*\])?)/gi
    public static readonly matchFunctionExpr = /\\([0-9a-z]+)[\n\r]*(?: *\[[ \n\r]*([^\]\n\r]*)\])?/i
    private static queries: QueryCollection = {}

    static async parse(text: string, metadata: IParserMetadata, variablesKey: string): Promise<JSX.Element> {
        if (!text)
            return null;

        if (metadata instanceof FileData)
            metadata = metadata.metadata;

        // Initialize variables
        let splits = text.split(this.matchBodyExpr);
        let variables: Variables = { ...(metadata.$vars ?? {})[variablesKey] ?? {} }
        for (var key in metadata) {
            if (typeof(metadata[key]) != typeof({}) && key !== "public" && key !== variablesKey) {
                variables[key] = metadata[key]
            }
        }

        // find variable content from text
        metadata.$vars = { ...metadata.$vars, [variablesKey]: this.parseVariables(splits, variables) };

        // replace variables in text with its respective content
        let withVars = text.replace(this.matchVarsExpr, (...x) => {
            let name = x[1]
            if (variables[name]) return variables[name]
            else if (metadata[name] && typeof(metadata[name]) != typeof({})) return metadata[name]
            else throw new ParseError(`Unset variable '${name}'`)
        });

        let withCalc = withVars.replace(this.matchCalcExpr, (...x) => {
            let body = x[1]
            let result = this.parseCalc(body, metadata.$values)
            return isNaN(result) ? '' : String(result)
        });

        splits = withCalc.split(this.matchBodyExpr);
        // build tree structure
        let tree = this.buildTree(splits);
        metadata.$queries = await this.resolveQueries(tree)
        return this.buildComponent(tree, variablesKey, 0, metadata)
    }
    
    private static buildTree(splits: string[]): IParserObject {
        try {
            let command: IParserObject = null;
            let stack: IParserObject[] = [];
            let current: IParserObject = { type: 'root', content: [], options: [], variables: {} };

            splits.forEach((part) => {
                switch (part) {
                    case '\{':
                        if (!command)
                            throw new ParseError("Unexpected content start (\{)");
                        stack.push(current);
                        current = command;
                        break;
                    case '\}':
                        if (stack.length == 0)
                            throw new ParseError("Unexpected content end (\})");
                        current = stack.pop();
                        command = null;
                        break;
                    default:
                        if (part)
                            command = this.parseFunction(part, current);
                        break;
                }
            })

            if (current.type !== 'root')
                throw new ParseError("Unexpected content start (\{)")
            return current;
        } catch (error: unknown) {
            if (error instanceof ParseError) 
                throw error;
            throw new ParseError("Failed parsing");
        }
    }

    private static parseCalc(text: string, values: Record<string, number> = {}): number {
        let splits = text.split(this.splitCalcExpr)
        let parts: (number | CalcOperation)[] = splits.map(split => (
            isEnum(split, CalcOperation) ? split : values[split] ?? parseFloat(split.replace(',', '.'))
        ))

        OperationsOrder.forEach(operation => {
            for (let i = 0; i < parts.length - 1; i++) {
                if (i > 0) {
                    let left  = parts[i - 1]
                    let right = parts[i + 1]
                    if (i > 0 && parts[i] === operation && isNumber(left) && isNumber(right)) {
                        switch (operation) {
                            case CalcOperation.Add:
                                parts = [...parts.slice(0, i - 1), left + right, ...parts.slice(i + 2)]
                                i--
                                break;
                            case CalcOperation.Subtract:
                                parts = [...parts.slice(0, i - 1), left - right, ...parts.slice(i + 2)]
                                i--
                                break;
                            case CalcOperation.Multiply:
                                parts = [...parts.slice(0, i - 1), left * right, ...parts.slice(i + 2)]
                                i--
                                break;
                            case CalcOperation.DivideDown:
                                parts = [...parts.slice(0, i - 1), Math.floor(left / right), ...parts.slice(i + 2)]
                                i--
                                break;
                            case CalcOperation.DivideUp:
                                parts = [...parts.slice(0, i - 1), Math.ceil(left / right), ...parts.slice(i + 2)]
                                i--
                                break;
                            default:
                                throw new ParseError(`Failed parsing calculation: ${text}, operation not defined for: ${operation}`)
                        }
                    }
                }
            }
        })

        return isNumber(parts[0]) ? parts[0] : NaN
    }

    private static parseVariables(splits: string[], data: Variables): Variables {
        let counter = 0;
        let variable: IParserObject = null;
        let content: string[] = [];
        splits.forEach((part) => {
            switch (part){
                case '\{':
                    counter++;
                    if (counter > 1 && variable)
                        content.push(part);
                    break;
                case '\}':
                    counter--;
                    if (counter === 0 && variable) {
                        data[variable.options[0].value] = content.join('');
                        variable = null;
                    } else if (variable) 
                        content.push(part);
                    break;
                default:
                    if (variable) {
                        content.push(part);
                    } else {;
                        let x = this.parseFunction(part, null);
                        if (x?.type === 'set' && x.options.length > 0){
                            variable = x;
                            content = [];
                        }
                    }
                    break;
            }
        });
        return data;
    }
    
    private static parseFunction(part: string, current: IParserObject): IParserObject {
        if (current && current.type === 'text') {
            current.options.push({ key: undefined, value: part.trim() })
            return current;
        }

        let result: IParserObject = null;
        part.split(this.splitFunctionExpr).forEach((part) => {
            if (part) {
                let hit = new RegExp(this.matchFunctionExpr).exec(part)
                if (hit) {
                    result = { 
                        type: hit[1], 
                        content: [], 
                        options: this.parseOptions(hit[2]),
                        variables: {}
                    };
                    current?.content.push(result);
                } else {
                    current?.content.push({ 
                        type: 'text', 
                        content: [], 
                        options: [{ key: undefined, value: part }] ,
                        variables: {}
                    })
                }
            }
        });

        return result ?? current;
    }

    private static parseOptions(options: string): IParserOption[] {
        let results: IParserOption[] = [];
        if (options) {
            let expr = new RegExp(this.matchOptionsExpr)
            let hit: RegExpExecArray = null;
            while(null != (hit = expr.exec(options))){
                results.push({ key: hit[1]?.trim(), value: hit[2]?.trim() })
            }
        }
        return results;
    }

    private static getQueries(tree: IParserObject): Queries {
        if (tree.type === 'set')
            return {}
        if (!(tree.type in ElementDictionary))
            throw new ParseError(`Unknown command '${tree.type}'`)
        
        let element = getElement(tree.type);
        tree.options.forEach((option) => {
            tree.variables[option.key ?? element.defaultKey] = option.value
        })

        let queries = tree.content.reduce((prev, e) => {
            let queries = this.getQueries(e);
            for (let key in queries) {
                prev[key] = Math.max(prev[key] ?? 0, queries[key])
            }
            return prev
        }, element.validate(tree.variables, tree.content))
        return queries
    }

    private static async resolveQueries(tree: IParserObject): Promise<QueryCollection> {
        let queries = this.getQueries(tree)
        let keys = Object.keys(queries)
        let filtered = keys.filter((key) => isObjectId(key) && !(key in this.queries)) as unknown as ObjectId[]
        
        if (filtered.length > 0) {
            let response = await Communication.getManyMetadata(arrayUnique(filtered))
            if (!response.success) {
                throw new ParseError("Failed to load some file out of files with ids: " + JSON.stringify(filtered))
            } else {
                response.result.forEach((res) => {
                    this.queries[String(res.id)] = res
                })
            }
        }
        
        let res: QueryCollection = {}
        for (let key in queries) {
            res[key] = this.queries[key]
        }
        
        return res
    }

    public static buildComponent(tree: IParserObject, variablesKey: string, key: number = 0, metadata: IParserMetadata, parent?: IParserObject): JSX.Element {
        if (tree.type === 'set')
            return null
        if (tree.type === 'text' && tree.variables.text?.trim() == '')
            return null;
        if (parent != null && parent.type !== 'table' && TableElementTypes.has(tree.type))
            throw new ParseError(`Element of type '\\${tree.type}' can only appear inside '\\table' elements.`)
             
        let element = getElement(tree.type);
        
        return (
            <element.toComponent 
                options={tree.variables} 
                content={tree.content} 
                metadata={metadata} 
                variablesKey={variablesKey}
                key={key}>
                {element.buildChildren && tree.content.map((child, key) => (
                    this.buildComponent(child, variablesKey, key, metadata, tree)
                ))}
            </element.toComponent>
        )
    }
}

export const useParser = (text: string, metadata: IParserMetadata, key: string): JSX.Element => {
    const [state, setState] = useState(null)
    useEffect(() => {
        Parser.parse(text, metadata, key)
        .then((res) => setState(res))
        .catch((error) => {
            if (error instanceof ParseError) {
                setState(<div className={styles.error}>{error.message}</div>);
            } else {
                setState(null);
                if (process.env.NODE_ENV == "development")
                    throw error;
            }
        })
    }, [text, metadata, key])
    return state
}

export default Parser;