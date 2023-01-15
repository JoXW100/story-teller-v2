import { ParseError } from 'utils/parser';
import { ElementObject, ElementParams, Variables } from 'types/elements';
import styles from 'styles/elements.module.scss';

const LineElement = ({}: ElementParams<{}>): JSX.Element => (
    <div className={styles.line}/>
)

export const element: Record<string, ElementObject> = {
    'line': {
        type: 'line',
        defaultKey: null,
        toComponent: LineElement,
        validate: (options: Variables) => {
            if (Object.keys(options).length > 0)
                throw new ParseError(`'line' command does not accept any options`);
            return {}
        }
    }
}

export default LineElement;