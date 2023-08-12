import { ParseError } from 'utils/parser';
import { IElementObject, ElementParams, Variables } from 'types/elements';
import styles from 'styles/elements.module.scss';

const CenterElement = ({ children }: ElementParams<{}>): JSX.Element => {
    return (
        <div className={styles.center}>
            { children }
        </div>
    )
}

 export const element: Record<string, IElementObject> = {
    center: {
        type: 'center',
        defaultKey: null,
        buildChildren: true,
        validOptions: null,
        toComponent: CenterElement,
        validate: (options: Variables) => {
            if (Object.keys(options).length > 0)
                throw new ParseError(`'center' command does not accept any options`);
            return {}
        }
    }
} satisfies Record<string, IElementObject>

export default CenterElement;