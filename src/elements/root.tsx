import { ParseError } from "utils/parser";
import { ElementParams, ElementObject, Variables } from 'types/elements'

const RootElement = ({ children }: ElementParams<{}>): JSX.Element => (
    <div> { children } </div>
)

export const element: Record<string, ElementObject> = {
    'root': {
        type: 'root',
        defaultKey: null,
        toComponent: RootElement,
        validate: (options: Variables) => {
            if (Object.keys(options).length > 0)
                throw new ParseError(`'text' command does not accept any options`);
            return {}
        }
    }
}

export default RootElement;