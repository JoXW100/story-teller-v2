import { ParseError } from 'utils/parser';
import { ElementObject, ElementParams, Variables } from 'types/elements';
import styles from 'styles/elements.module.scss';

const CenterElement = ({ children }: ElementParams<{}>): JSX.Element => {
    return (
        <div className={styles.center}>
            { children }
        </div>
    )
}

 export const element: Record<string, ElementObject> = {
    'center': {
        type: 'center',
        defaultKey: null,
        buildChildren: true,
        inline: false,
        lineBreak: true,
        container: true,
        toComponent: CenterElement,
        validate: (options: Variables) => {
            if (Object.keys(options).length > 0)
                throw new ParseError(`'center' command does not accept any options`);
            return {}
        }
    }
}

export default CenterElement;