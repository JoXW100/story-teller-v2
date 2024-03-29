import { ParseError } from 'utils/parser';
import { IElementObject, ElementParams, Variables } from 'types/elements';

const NewLineElement = ({}: ElementParams<{}>): JSX.Element => (
    <br/>
)

const _element = {
    type: 'newline',
    defaultKey: null,
    buildChildren: false,
    validOptions: null,
    toComponent: NewLineElement,
    validate: (options: Variables) => {
        if (Object.keys(options).length > 0)
            throw new ParseError(`'newline' command does not accept any options`);
        return {}
    }
} satisfies IElementObject

export const element = {
    n: _element,
    newline: _element
} satisfies Record<string, IElementObject>

export default NewLineElement;