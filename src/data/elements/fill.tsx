import { ParseError } from 'utils/parser';
import { IElementObject, ElementParams, Variables } from 'types/elements';
import styles from 'styles/elements.module.scss';

const FillElement = ({ children }: ElementParams<{}>): JSX.Element => {
    return (
        <div className={styles.fill}> 
            { children } 
        </div>
    )
}

export const element = {
    fill: {
        type: 'fill',
        defaultKey: null,
        buildChildren: true,
        validOptions: null,
        toComponent: FillElement,
        validate: (options: Variables) => {
            if (Object.keys(options).length > 0)
                throw new ParseError(`'fill' command does not accept any options`);
            return {}
        }
    }
} satisfies Record<string, IElementObject>

export default FillElement;