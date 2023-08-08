import { ParseError } from 'utils/parser';
import { ElementObject, ElementParams, Variables } from 'types/elements';

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
} satisfies ElementObject

export const element = {
    n: _element,
    newline: _element
} satisfies Record<string, ElementObject>

export default NewLineElement;