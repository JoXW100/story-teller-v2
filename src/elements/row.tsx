import { ParseError } from "utils/parser";
import { ElementObject, ElementParams, Variables } from 'types/elements';
import styles from 'styles/elements.module.scss';

const RowElement = ({ children }: ElementParams<{}>): JSX.Element => {
    return <div className={styles.row}> { children } </div>
}

export const element: { [s: string]: ElementObject; } = {
    'row': {
        type: 'row',
        defaultKey: null,
        validOptions: new Set(),
        toComponent: RowElement,
        validate: (options: Variables) => {
            if (Object.keys(options).length > 0)
                throw new ParseError(`'row' command does not accept any options`);
            return {}
        }
    }
}

export default RowElement;