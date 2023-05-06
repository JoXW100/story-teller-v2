import { ParseError } from 'utils/parser';
import { ElementObject, ElementParams, Variables } from 'types/elements';

const BoldElement = ({ options, metadata, ...args }: ElementParams<{}>): JSX.Element => {
    return <b {...args}/>
}

const x: ElementObject = {
    type: 'bold',
    defaultKey: null,
    inline: true,
    lineBreak: false,
    container: false,
    toComponent: BoldElement,
    validate: (options: Variables) => {
        if (Object.keys(options).length > 0)
            throw new ParseError(`'bold' command does not accept any options`);
        return {}
    }
}

export const element: Record<string, ElementObject> = {
    b: x,
    bold: x
}

export default BoldElement;