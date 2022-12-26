import { ParseError } from 'utils/parser';
import { ElementObject, ElementParams } from 'types/elements';
import styles from 'styles/elements/main.module.scss';

const LineElement = ({}: ElementParams<{}>): JSX.Element => {
    return (
        <div className={styles.line}/>
    )
}

export const element: { [s: string]: ElementObject; } = {
    'line': {
        type: 'line',
        defaultKey: null,
        validOptions: new Set(),
        toComponent: LineElement,
        validate: (options) => {
            if (Object.keys(options).length > 0)
                throw new ParseError(`'line' command does not accept any options`);
            return {}
        }
    }
}

export default LineElement;