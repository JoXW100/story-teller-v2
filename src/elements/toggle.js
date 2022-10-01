import Parser, { ParseError } from 'utils/parser';
import { useEffect, useMemo, useState } from 'react';
import styles from 'styles/elements/main.module.scss';

const validOptions = ['content', 'alt', 'state'];
const validateOptions = (options) => {
    Object.keys(options).forEach((key) => {
        if (!validOptions.some((x) => x === key))
            throw new ParseError(`Unexpected box option: '${key}'`);
    });
}

/**
 * @param {{ options: Object.<string, string>, children: JSX.Element }} 
 * @returns {JSX.Element}
 */
const ToggleElement = ({ options = {}, metadata }) => {
    const [toggle, setToggle] = useState(options.state === "true");
    const [content, setContent] = useState(null);

    useEffect(() => {
        var key = toggle ? options.alt : options.content;
        if (key)
        {
            var data = metadata.$vars[key];
            Parser.parse(data, metadata)
            .then((res) => setContent(res))
            .catch(() => setContent(null))
        }
    }, [toggle, options])

    const handleClick = () => {
        setToggle(!toggle)
    }


    return (
        <div className={styles.toggle} onClick={handleClick}>
            { content }
        </div>
    )
}

/**
 * @type {Object.<string, RenderElement>}
 */
 export const element = {
    'toggle': {
        type: 'toggle',
        defaultKey: 'content',
        validOptions: validOptions,
        toComponent: ToggleElement,
        validateOptions: validateOptions
    }
}

export default ToggleElement;