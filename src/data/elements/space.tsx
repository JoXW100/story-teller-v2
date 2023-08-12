import { ParseError } from 'utils/parser';
import { IElementObject, ElementParams, Variables } from 'types/elements';
import styles from 'styles/elements.module.scss';

const spaceElement = ({}: ElementParams<{}>): JSX.Element => (
    <div className={styles.space}/>
)

export const element = {
    space: {
        type: 'space',
        defaultKey: null,
        buildChildren: false,
        validOptions: null,
        toComponent: spaceElement,
        validate: (options: Variables) => {
            if (Object.keys(options).length > 0)
                throw new ParseError(`'line' command does not accept any options`);
            return {}
        }
    }
} satisfies Record<string, IElementObject>

export default spaceElement;