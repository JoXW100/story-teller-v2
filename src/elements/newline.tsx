import { ParseError } from 'utils/parser';
import { ElementObject, ElementParams, Variables } from 'types/elements';

const NewLineElement = ({}: ElementParams<{}>): JSX.Element => (
    <br/>
)

const _element: ElementObject = {
    type: 'newline',
    defaultKey: null,
    validOptions: new Set(),
    toComponent: NewLineElement,
    validate: (options: Variables) => {
        if (Object.keys(options).length > 0)
            throw new ParseError(`'newline' command does not accept any options`);
        return {}
    }
}

export const element: { [s: string]: ElementObject; } = {
    'n': _element,
    'newline': _element
}

export default NewLineElement;