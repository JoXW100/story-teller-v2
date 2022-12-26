import Parser, { ParseError } from 'utils/parser';
import { useEffect, useState } from 'react';
import { Queries, ElementObject, ElementParams, Variables } from 'types/elements';
import styles from 'styles/elements/main.module.scss';

interface ToggleOptions extends Variables {
    content?: string
    alt?: string
    state?: string
}

const validOptions = new Set(['content', 'alt', 'state']);
const validateOptions = (options: Variables): Queries => {
    Object.keys(options).forEach((key) => {
        if (!validOptions.has(key))
            throw new ParseError(`Unexpected box option: '${key}'`);
    });
    return {}
}

const ToggleElement = ({ options = {}, metadata }: ElementParams<ToggleOptions>): JSX.Element => {
    const [toggle, setToggle] = useState(options.state === "true");
    const [content, setContent] = useState(null);

    useEffect(() => {
        var key = toggle ? options.alt : options.content;
        if (key) {
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

export const element: { [s: string]: ElementObject; } = {
    'toggle': {
        type: 'toggle',
        defaultKey: 'content',
        validOptions: validOptions,
        toComponent: ToggleElement,
        validate: validateOptions
    }
}

export default ToggleElement;