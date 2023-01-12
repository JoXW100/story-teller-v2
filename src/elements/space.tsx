import { ParseError } from 'utils/parser';
import { ElementObject, ElementParams, Variables } from 'types/elements';
import styles from 'styles/elements.module.scss';

const spaceElement = ({}: ElementParams<{}>): JSX.Element => {
    return (
        <div className={styles.space}/>
    )
}

export const element: { [s: string]: ElementObject; } = {
    'space': {
        type: 'space',
        defaultKey: null,
        validOptions: new Set(),
        toComponent: spaceElement,
        validate: (options: Variables) => {
            if (Object.keys(options).length > 0)
                throw new ParseError(`'line' command does not accept any options`);
            return {}
        }
    }
}

export default spaceElement;