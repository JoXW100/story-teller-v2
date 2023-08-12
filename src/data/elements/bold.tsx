import { ParseError } from 'utils/parser';
import { IElementObject, ElementParams } from 'types/elements';

const BoldElement = ({ options, metadata, content, variablesKey, ...args }: ElementParams<{}>): JSX.Element => {
    return <b {...args}/>
}

const x = {
    type: 'bold',
    defaultKey: null,
    buildChildren: true,
    validOptions: null,
    toComponent: BoldElement,
    validate: (options) => {
        if (Object.keys(options).length > 0)
            throw new ParseError(`'bold' command does not accept any options`);
        return {}
    }
} satisfies IElementObject

export const element = {
    b: x,
    bold: x
} satisfies Record<string, IElementObject>

export default BoldElement;