import { ParseError } from "utils/parser";
import { ElementParams, ElementObject } from 'types/elements'

const RootElement = ({ children }: ElementParams<{}>): JSX.Element => (
    <div> { children } </div>
)

export const element: { [s: string]: ElementObject; } = {
    'root': {
        type: 'root',
        defaultKey: null,
        validOptions: new Set(),
        toComponent: RootElement,
        validate: (options) => {
            if (Object.keys(options).length > 0)
                throw new ParseError(`'text' command does not accept any options`);
            return {}
        }
    }
}

export default RootElement;