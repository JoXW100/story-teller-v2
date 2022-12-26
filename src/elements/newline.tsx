import { ParseError } from 'utils/parser';
import { ElementObject, ElementParams } from 'types/elements';

const NewLineElement = ({}: ElementParams<{}>): JSX.Element => {
    return <br/>
}

const _element: ElementObject = {
    type: 'newline',
    defaultKey: null,
    validOptions: new Set(),
    toComponent: NewLineElement,
    validate: (options) => {
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