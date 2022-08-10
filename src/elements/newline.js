
/**
 * @param {{ options: Object.<string, string>, children: JSX.Element }} 
 * @returns {JSX.Element}
 */
const NewLineElement = ({ options, children }) => {
    return <br/>
}

const x = {
    type: 'newline',
    defaultKey: null,
    validOptions: [],
    toComponent: NewLineElement,
    validateOptions: (options) => {
        if (Object.keys(options).length > 0)
            throw new ParseError(`'line' command does not accept any options`);
    }
}

/**
 * @type {Object.<string, RenderElement>}
 */
export const element = {
    'n': x,
    'newline': x
}

export default NewLineElement;