/**
 * @param {{ options: Object.<string, string>, children: JSX.Element }} 
 * @returns {JSX.Element}
 */
 const TextElement = ({ options, children }) => {
    return children
}

/**
 * @type {Object.<string, RenderElement>}
 */
 export const element = {
    'text': {
        type: 'text',
        defaultKey: null,
        validOptions: [],
        toComponent: TextElement,
        validateOptions: (options) => {
            if (Object.keys(options).length > 0)
                throw new ParseError(`'line' command does not accept any options`);
        }
    }
}

export default TextElement;