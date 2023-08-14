import React, { useEffect, useState } from "react";
import Communication from "./communication";
import { arrayUnique, isObjectId } from "./helpers";
import { ElementDictionary, TableElementTypes, getElement } from "data/elements";
import { Variables, Queries, IParserMetadata, QueryCollection, IParserObject, IParserOption } from "types/elements";
import styles from 'styles/renderer.module.scss';
import { ObjectId } from "types/database";

export class ParseError extends Error {
    constructor(message: string) {
        super(`Parse error: ${message}`);
    }
}

abstract class Parser
{
    public static readonly matchVarsExpr = /\$([a-z0-9]+)/gi
    public static readonly matchBodyExpr = /([\{\}])/
    public static readonly matchOptionsExpr = /,? *(?:([a-z0-9]+):(?!\/) *)?([^\n\r,]+ *)/gi
    public static readonly splitFunctionExpr = /(\\[0-9a-z]+[\n\r]*(?: *\[[ \n\r]*[^\]\n\r]*\])?)/gi
    public static readonly matchFunctionExpr = /\\([0-9a-z]+)[\n\r]*(?: *\[[ \n\r]*([^\]\n\r]*)\])?/i
    private static queries: QueryCollection = {}

    static async parse(text: string, metadata: IParserMetadata, variablesKey: string): Promise<JSX.Element> {
        if (!text)
            return null

        let splits = text.split(this.matchBodyExpr);
        let variables: Variables = { ...(metadata.$vars ?? {})[variablesKey] ?? {} }
        Object.keys(metadata).forEach(key => {
            if (typeof(metadata[key]) != typeof({}) && key !== "public" && key !== variablesKey) {
                variables[key] = metadata[key]
            }
        });

        // find variable content from text
        metadata.$vars = { ...metadata.$vars, [variablesKey]: this.parseVariables(splits, variables) };
        // replace variables in text with its respective content
        let withVars = text.replace(this.matchVarsExpr, (...x) => {
            if (variables[x[1]]) return variables[x[1]]
            else if (metadata[x[1]] && typeof(metadata[x[1]]) != typeof({})) return metadata[x[1]]
            else throw new ParseError(`Unset variable '${x[1]}'`)
        });

        splits = withVars.split(this.matchBodyExpr);
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
            if (current.type !== 'root') {
                throw new ParseError("Unexpected content start (\{)")
            }
            return current;
        } catch (error) {
            if (error instanceof ParseError) 
                throw error;
            throw new ParseError("Failed parsing");
        }
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
            let Q = this.getQueries(e);
            for (let q in Q) {
                prev[q] = Math.max(prev[q] ?? 0, Q[q])
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
        let children = element.buildChildren    
            ? tree.content.map((child, key) => this.buildComponent(child, variablesKey, key, metadata, tree))
            : null;
        return (
            <element.toComponent 
                options={tree.variables} 
                content={tree.content} 
                metadata={metadata} 
                variablesKey={variablesKey}
                key={key}>
                { children }
            </element.toComponent>
        )
    }
}

export const useParser = (text: string, metadata: IParserMetadata, key: string, dependency?: object): JSX.Element => {
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
    }, [text, dependency ? dependency : metadata, key])
    return state
}

export default Parser;