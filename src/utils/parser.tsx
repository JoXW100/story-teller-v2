
import React, { useEffect, useState } from "react";
import { ElementDictionary } from "elements";
import type { Variables, Queries, QueryResult, Metadata, ParserOption, ParserObject, ElementObject } from "types/elements";
import { FileGetManyMetadataResult } from "types/database/files";
import { DBResponse } from "types/database";
import styles from 'styles/renderer.module.scss';

export class ParseError extends Error {
    constructor(message: string) {
        super(`Parse error: ${message}`);
    }
}

class Parser
{
    private static readonly matchVarsExpr = /\$([a-z0-9]+)/gi
    private static readonly matchBodyExpr = /([\{\}])/
    private static readonly matchOptionsExpr = /,? *(?:([a-z0-9]+):(?!\/) *)?([^\n\r,]+ *)/gi
    private static readonly splitFunctionExpr = /(\\[0-9a-z]+[\n\r]*(?: *\[[ \n\r]*[^\]]*\])?)/gi
    private static readonly matchFunctionExpr = /\\([0-9a-z]+)[\n\r]*(?: *\[[ \n\r]*([^\]]*)\])?/i
    private static queries: QueryResult = {}

    static async parse(text: string, metadata: Metadata): Promise<JSX.Element> {
        if (!text)
            return null
        var splits = text.split(this.matchBodyExpr);
        var variables: Variables = { ...metadata.$vars ?? {} }
        // find variable content from text
        metadata.$vars = this.parseVariables(splits, variables);
        // replace variables in text with its respective content
        var withVars = text.replace(this.matchVarsExpr, (...x) => variables[x[1]] ?? '');
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
        try {
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
        } catch (error) {
           throw error;
        }
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
        }, element.validate(tree.variables))
        return queries
    }

    private static async resolveQueries(tree: ParserObject): Promise<QueryResult> {
        var queries: Queries = this.getQueries(tree)
        var keys = Object.keys(queries)
        var filtered = keys.filter((key) => !(key in this.queries))
        //console.log(`local [${Object.keys(this.queries).length}]:`, this.queries, 
        //    `\nqueries [${keys.length}]:`, queries, 
        //    `\nfiltered [${filtered.length}]:`, filtered)

        
        if (filtered.length > 0) {
            var response: DBResponse<FileGetManyMetadataResult>
            try {
                var data = await fetch(`/api/database/getManyMetadata?fileIds=${filtered}`)
                response = await data.json()
            } catch (error) {
                throw new ParseError("Failed when fetching metadata: " + error)
            }
            
            if (!response.success)
                throw new ParseError("Failed to load some file out of files with ids: " + JSON.stringify(filtered))
            var result = response.result as FileGetManyMetadataResult
            result.forEach((res) => {
                this.queries[String(res.id)] = res
            })
        }
        
        var res: QueryResult = {}
        for (var key in queries) {
            res[key] = this.queries[key]
        }
        
        return res
    }

    private static buildComponent(tree: ParserObject, key: number = 0, metadata: Metadata): JSX.Element {
        if (tree.type === 'set')
            return null
        if (tree.type === 'text' && tree.variables.text?.trim() == '')
            return null;
        let element = ElementDictionary[tree.type] as ElementObject;
        const Element = element.toComponent;
        const Content = tree.content.map((node, key) => this.buildComponent(node, key, metadata))
        
        return (
            <Element options={tree.variables} metadata={metadata} key={key}>
                { Content }
            </Element>
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
            }
            else {
                setState(null);
                throw error;
            }
        })
    }, [text, metadata])
    return state
}

export default Parser;