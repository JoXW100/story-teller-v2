import { ParseError } from 'utils/parser';
import { ElementObject, ElementParams, Variables } from 'types/elements';

const BoldElement = ({ options, metadata, content, ...args }: ElementParams<{}>): JSX.Element => {
    return <b {...args}/>
}

const x = {
    type: 'bold',
    defaultKey: null,
    buildChildren: true,
    inline: true,
    lineBreak: false,
    container: false,
    toComponent: BoldElement,
    validate: (options: Variables) => {
        if (Object.keys(options).length > 0)
            throw new ParseError(`'bold' command does not accept any options`);
        return {}
    }
} satisfies ElementObject

export const element = {
    b: x,
    bold: x
} satisfies Record<string, ElementObject>

export default BoldElement;