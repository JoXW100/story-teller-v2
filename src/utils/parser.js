
import ElementDictionary from "elements";
/**
 * @typedef ParserObject
 * @property {string} type
 * @property {[ParserObject|ParserValue]} content
 * @property {[ParserOption]} options
 */

/**
 * @typedef {string|number} ParserValue
 */

/**
 * @typedef ParserOption
 * @property {string} option
 * @property {string} value
 */

export class ParseError extends Error {
    static get type() { return 'ParseError' }

    constructor(message) {
        super(`Parse error: ${message}`);
        this.type = 'ParseError';
    }
}


class Parser
{
    /**
     * @param {string} text
     * @returns {Promise<JSX.Element>}
     */
    static parse(text) {
        return new Promise((resolve, reject) => {
            var splits = text?.split(/([\{\}])/) ?? [];
            var tree = this.#buildTree(splits);
            // First node is root
            resolve((<> { tree.content.map((node, key) => this.#buildComponent(node, key)) } </>));
        });
    }

    /**
     * @param {ParserObject} root 
     * @param {[string]} splits 
     */
    static #buildTree(splits) {
        var command = null;
        var stack = [];
        var current = { type: 'root', content: [], options: [] };
        splits.forEach((part) => {
            switch (part){
                case '\{':
                    if (!command)
                        throw new ParseError("Unexpected content start (\{})");
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
                    if (part) {
                        command = this.#parseFunction(part, current);
                    }
            }
        });
        if (current.type !== 'root')
            throw new ParseError("Unexpected content start (\{})")
        return current;
    }

    /**
     * 
     * @param {string} part 
     * @param {ParserObject} current
     * @returns {ParserObject}
     */
    static #parseFunction(part, current) {
        const splitExpr = /(\\[0-9a-z]+[\n\r]*(?: *\[[ \n\r]*[^\]]*\])?)/gi;
        const expr = /\\([0-9a-z]+)[\n\r]*(?: *\[[ \n\r]*([^\]]*)\])?/i;
        
        if (current.type === 'text') {
            current.content = part;
            return current;
        }

        var result = null;
        part.split(splitExpr).forEach((part) => {
            if (!part) 
                return;
                
            var hit = new RegExp(expr).exec(part);
            if (hit) {
                result = { type: hit[1], content: [], options: this.#parseOptions(hit[2])};
                current.content.push(result);
            }
            else {
                current.content.push({ type: 'text', content: part, options: [] });
            }
        });

        return result ?? current;
    }

    /**
     * @param {string} options 
     * @returns {[ParserOption]}
     */
    static #parseOptions(options) {
        const expr = new RegExp(/,? *(?:([a-z0-9]+): *)?([^\n\r,]+ *)/gi);

        if (!options)
            return [];

        var results = [];
        var hit = null;
        while(null != (hit = expr.exec(options))){
            var option = { option: hit[1]?.trim(), value: hit[2]?.trim() };
            results.push(option);
        }

        return results;
    }

    /**
     * 
     * @param {ParserObject} tree 
     */
    static #buildComponent(tree, key = 0) {
        var element = ElementDictionary[tree.type];
        if (!element)
            throw new ParseError(`Unknown command '${tree.type}'`);
        if (tree.type === 'text' && tree.content.trim() == '')
            return null;

        var options = {};
        tree.options.forEach((x) => {
            options[x.option ?? element.defaultKey] = x.value
        });

        element.validateOptions(options);
        const Element = element.toComponent;
        const Content = tree.type === 'text'
            ? tree.content
            : tree.content.map((node, key) => this.#buildComponent(node, key));

        return (
            <Element options={options} key={key}>
                { Content }
            </Element>
        )
    }
}

export default Parser;