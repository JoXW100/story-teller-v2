import { ParseError } from 'utils/parser';
import styles from 'styles/elements/main.module.scss';
import Icons from 'assets/icons';

const validOptions = ['icon', 'tooltips'];
const validateOptions = (options) => {
    Object.keys(options).forEach((key) => {
        if (!validOptions.some((x) => x === key))
            throw new ParseError(`Unexpected icon option: '${key}'`);
    });
}

/**
 * @param {{ options: Object.<string, string>, children: JSX.Element }} 
 * @returns {JSX.Element}
 */
const IconElement = ({ options = {}, icon }) => {
    const Icon = Icons[options ? options.icon : icon] ?? (() => null)
    return (
        <span className={styles.icon} tooltips={options.tooltips}>
            { <Icon/> }
        </span>
    )
}

/**
 * @type {Object.<string, RenderElement>}
 */
 export const element = {
    'icon': {
        type: 'icon',
        defaultKey: 'icon',
        validOptions: validOptions,
        toComponent: IconElement,
        validateOptions: validateOptions
    }
}

export default IconElement;