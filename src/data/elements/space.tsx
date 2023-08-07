import { ParseError } from 'utils/parser';
import { ElementObject, ElementParams, Variables } from 'types/elements';
import styles from 'styles/elements.module.scss';

const spaceElement = ({}: ElementParams<{}>): JSX.Element => (
    <div className={styles.space}/>
)

export const element = {
    space: {
        type: 'space',
        defaultKey: null,
        buildChildren: false,
        inline: false,
        lineBreak: true,
        container: false,
        toComponent: spaceElement,
        validate: (options: Variables) => {
            if (Object.keys(options).length > 0)
                throw new ParseError(`'line' command does not accept any options`);
            return {}
        }
    }
} satisfies Record<string, ElementObject>

export default spaceElement;