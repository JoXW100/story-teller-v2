import { ParseError } from 'utils/parser';
import { ElementObject, ElementParams, Variables } from 'types/elements';
import styles from 'styles/elements.module.scss';

const FillElement = ({ children }: ElementParams<{}>): JSX.Element => {
    return (
        <div className={styles.fill}> 
            { children } 
        </div>
    )
}

export const element: Record<string, ElementObject> = {
    'fill': {
        type: 'fill',
        defaultKey: null,
        inline: true,
        lineBreak: false,
        container: false,
        toComponent: FillElement,
        validate: (options: Variables) => {
            if (Object.keys(options).length > 0)
                throw new ParseError(`'fill' command does not accept any options`);
            return {}
        }
    }
}

export default FillElement;