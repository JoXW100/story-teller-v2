import { ParseError } from "utils/parser";
import { Queries, ElementObject, ElementParams, Variables } from 'types/elements';

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

export const element: Record<string, ElementObject> = {
    'text': {
        type: 'text',
        defaultKey: 'text',
        inline: true,
        lineBreak: false,
        container: false,
        toComponent: TextElement,
        validate: validateOptions
    }
}

export default TextElement;