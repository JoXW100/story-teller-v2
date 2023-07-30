
import React, { useEffect, useState } from "react";
import { ElementDictionary, TableElementTypes } from "elements";
import type { Variables, Queries, QueryResult, Metadata, ParserOption, ParserObject, ElementObject } from "types/elements";
import { FileGetManyMetadataResult } from "types/database/files";
import styles from 'styles/renderer.module.scss';
import Communication from "./communication";
import { arrayUnique } from "./helpers";

export class ParseError extends Error {
    constructor(message: string) {
        super(`Parse error: ${message}`);
    }
}

class Parser
{
    public static readonly matchVarsExpr = /\$([a-z0-9]+)/gi
    public static readonly matchBodyExpr = /([\{\}])/
    public static readonly matchOptionsExpr = /,? *(?:([a-z0-9]+):(?!\/) *)?([^\n\r,]+ *)/gi
    public static readonly splitFunctionExpr = /(\\[0-9a-z]+[\n\r]*(?: *\[[ \n\r]*[^\]]*\])?)/gi
    public static readonly matchFunctionExpr = /\\([0-9a-z]+)[\n\r]*(?: *\[[ \n\r]*([^\]]*)\])?/i
    private static queries: QueryResult = {}

    static async parse(text: string, metadata: Metadata): Promise<JSX.Element> {
        if (!text)
            return null
        var splits = text.split(this.matchBodyExpr);
        var variables: Variables = { ...metadata.$vars ?? {} }
        // find variable content from text
        metadata.$vars = this.parseVariables(splits, variables);
        // replace variables in text with its respective content
        var withVars = text.replace(this.matchVarsExpr, (...x) => {
            if (variables[x[1]]) return variables[x[1]]
            else if (metadata[x[1]] && typeof(metadata[x[1]]) != typeof({})) return metadata[x[1]]
            else throw new ParseError(`Unset variable '${x[1]}'`)
        });
        var splits = withVars.split(this.matchBodyExpr);
        // build tree structure
        var tree = this.buildTree(splits);
        metadata.$queries = await this.resolveQueries(tree)
        return this.buildComponent(tree, 0, metadata)
    }
    
    private static buildTree(splits: string[]): ParserObject {
        try {
            var command: ParserObject = null;
            var stack: ParserObject[] = [];
            var current: ParserObject = { type: 'root', content: [], options: [], variables: {} };
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
        var counter = 0;
        var variable: ParserObject = null;
        var content: string[] = [];
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
                        var x = this.parseFunction(part, null);
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
    
    private static parseFunction(part: string, current: ParserObject | null): ParserObject {
        if (current != null && current.type === 'text') {
            current.options.push({ key: undefined, value: part.trim() })
            return current;
        }

        var result: ParserObject = null;
        part.split(this.splitFunctionExpr).forEach((part) => {
            if (part) {
                var hit = new RegExp(this.matchFunctionExpr).exec(part)
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

    private static parseOptions(options: string): ParserOption[] {
        var results: ParserOption[] = [];
        if (options) {
            var expr = new RegExp(this.matchOptionsExpr)
            var hit: RegExpExecArray = null;
            while(null != (hit = expr.exec(options))){
                results.push({ key: hit[1]?.trim(), value: hit[2]?.trim() })
            }
        }
        return results;
    }

    private static getQueries(tree: ParserObject): Queries {
        if (tree.type === 'set')
            return {}
        if (!(tree.type in ElementDictionary))
            throw new ParseError(`Unknown command '${tree.type}'`)
        
        let element = ElementDictionary[tree.type] as ElementObject;
        tree.options.forEach((option) => {
            tree.variables[option.key ?? element.defaultKey] = option.value
        })

        let queries = tree.content.reduce((prev, e) => {
            var Q = this.getQueries(e);
            for (var q in Q) {
                prev[q] = Math.max(prev[q] ?? 0, Q[q])
            }
            return prev
        }, element.validate(tree.variables, tree.content))
        return queries
    }

    private static async resolveQueries(tree: ParserObject): Promise<QueryResult> {
        let queries: Queries = this.getQueries(tree)
        let keys = Object.keys(queries)
        let filtered = keys.filter((key) => !(key in this.queries))
        
        if (filtered.length > 0) {
            let response = await Communication.getManyMetadata(arrayUnique(filtered))
            if (!response.success)
                throw new ParseError("Failed to load some file out of files with ids: " + JSON.stringify(filtered))
                let result = response.result as FileGetManyMetadataResult
            result.forEach((res) => {
                this.queries[String(res.id)] = res
            })
        }
        
        let res: QueryResult = {}
        for (var key in queries) {
            res[key] = this.queries[key]
        }
        
        return res
    }

    public static buildComponent(tree: ParserObject, key: number = 0, metadata: Metadata, parent?: ParserObject): JSX.Element {
        if (tree.type === 'set')
            return null
        if (tree.type === 'text' && tree.variables.text?.trim() == '')
            return null;
        if (parent != null && parent.type !== 'table' && TableElementTypes.has(tree.type))
            throw new ParseError(`Element of type '\\${tree.type}' can only appear inside '\\table' elements.`)
             
        let element = ElementDictionary[tree.type];
        let children = element.buildChildren    
            ? tree.content.map((child, key) => this.buildComponent(child, key, metadata, tree))
            : null;
        return (
            <element.toComponent 
                options={tree.variables} 
                content={tree.content} 
                metadata={metadata} 
                key={key}>
                { children }
            </element.toComponent>
        )
    }
}

export const useParser = (text: string, metadata: Metadata): JSX.Element => {
    const [state, setState] = useState(null)
    useEffect(() => {
        Parser.parse(text, metadata)
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
    }, [text, metadata])
    return state
}

export default Parser;