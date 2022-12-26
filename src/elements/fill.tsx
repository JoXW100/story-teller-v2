import { ParseError } from 'utils/parser';
import { ElementObject, ElementParams } from 'types/elements';
import styles from 'styles/elements.module.scss';

const FillElement = ({ children }: ElementParams<{}>): JSX.Element => {
    return (
        <div className={styles.fill}> {children} </div>
    )
}

export const element: { [s: string]: ElementObject; } = {
    'fill': {
        type: 'fill',
        defaultKey: null,
        validOptions: new Set(),
        toComponent: FillElement,
        validate: (options) => {
            if (Object.keys(options).length > 0)
                throw new ParseError(`'fill' command does not accept any options`);
            return {}
        }
    }
}

export default FillElement;