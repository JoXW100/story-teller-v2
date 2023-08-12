import { ParseError } from "utils/parser";
import { Queries, IElementObject, ElementParams, Variables } from 'types/elements';

interface TextOptions extends Variables {
    text: string
}

const validOptions = new Set(['text']);
const validateOptions = (options: TextOptions): Queries => {
    Object.keys(options).forEach((key) => {
        if (!validOptions.has(key))
            throw new ParseError(`Unexpected box option: '${key}'`);
    });
    return {}
}


const TextElement = ({ options, ...args }: ElementParams<TextOptions>): JSX.Element => (
    <>{options?.text ?? args.children}</>
)

export const element = {
    text: {
        type: 'text',
        defaultKey: 'text',
        buildChildren: true,
        validOptions: validOptions,
        toComponent: TextElement,
        validate: validateOptions
    }
} satisfies Record<string, IElementObject>

export default TextElement;