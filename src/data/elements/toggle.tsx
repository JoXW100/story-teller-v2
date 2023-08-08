import Parser, { ParseError } from 'utils/parser';
import { useEffect, useState } from 'react';
import { Queries, ElementObject, ElementParams, Variables } from 'types/elements';
import styles from 'styles/elements.module.scss';

interface ToggleOptions extends Variables {
    content?: string
    alt?: string
    state?: string
}

class Options implements ToggleOptions {
    protected readonly options: ToggleOptions;
    [key: string]: any

    constructor(options: ToggleOptions) {
        this.options =  options ?? {}
    }

    public get content(): string {
        return this.options.content ?? this.options.alt ?? null
    }

    public get alt(): string {
        return this.options.alt ?? this.options.content ?? null
    }

    public get state(): string {
        return this.options.state ?? "false"
    }

    public get stateValue(): boolean {
        return this.state == "true"
    }
}

const validOptions = new Set(['content', 'alt', 'state']);
const validateOptions = (options: ToggleOptions): Queries => {
    Object.keys(options).forEach((key) => {
        if (!validOptions.has(key))
            throw new ParseError(`Unexpected box option: '${key}'`);
    });
    return {}
}

const ToggleElement = ({ options = {}, metadata, variablesKey }: ElementParams<ToggleOptions>): JSX.Element => {
    const toggleOptions = new Options(options)
    const [toggle, setToggle] = useState(toggleOptions.stateValue);
    const [content, setContent] = useState(null);

    useEffect(() => {
        var key = toggle 
            ? toggleOptions.alt 
            : toggleOptions.content;
        if (key) {
            var data = (metadata.$vars[variablesKey] ?? {})[key];
            Parser.parse(data, metadata, variablesKey)
            .then((res) => setContent(res))
            .catch(() => setContent(null))
        } else {
            setContent(null)
        }
    }, [toggle, options.alt, options.content])

    const handleClick = () => {
        setToggle(!toggle)
    }

    return (
        <div className={styles.toggle} onClick={handleClick}>
            { content }
        </div>
    )
}

export const element = {
    toggle: {
        type: 'toggle',
        defaultKey: 'content',
        buildChildren: false,
        validOptions: validOptions,
        toComponent: ToggleElement,
        validate: validateOptions
    }
} satisfies Record<string, ElementObject>

export default ToggleElement;