import { ParseError } from 'utils/parser';
import { ElementObject, ElementParams } from 'types/elements';

const BoldElement = ({ options, metadata, ...args }: ElementParams<{}>): JSX.Element => {
    return <b {...args}/>
}

const x: ElementObject = {
    type: 'bold',
    defaultKey: null,
    validOptions: new Set(),
    toComponent: BoldElement,
    validate: (options) => {
        if (Object.keys(options).length > 0)
            throw new ParseError(`'bold' command does not accept any options`);
        return {}
    }
}

export const element: { [s: string]: ElementObject } = {
    b: x,
    bold: x
}

export default BoldElement;