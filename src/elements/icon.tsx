import { ParseError } from 'utils/parser';
import Icons from 'assets/icons';
import { Queries, ElementObject, ElementParams, Variables } from 'types/elements';
import styles from 'styles/elements.module.scss';

interface IconOptions extends Variables {
    icon?: string
    tooltips?: string
}

const validOptions = new Set(['icon', 'tooltips']);
const validateOptions = (options: Variables): Queries => {
    Object.keys(options).forEach((key) => {
        if (!validOptions.has(key))
            throw new ParseError(`Unexpected icon option: '${key}'`);
    });
    return {}
}

const IconElement = ({ options = {} }: ElementParams<IconOptions>): JSX.Element => {
    const Icon = Icons[options.icon] ?? (() => null)
    return (
        <span tooltips={options.tooltips} className={styles.icon}> <Icon/> </span>
    )
}

export const element: { [s: string]: ElementObject; } = {
    icon: {
        type: 'icon',
        defaultKey: 'icon',
        validOptions: validOptions,
        toComponent: IconElement,
        validate: validateOptions
    }
}

export default IconElement;