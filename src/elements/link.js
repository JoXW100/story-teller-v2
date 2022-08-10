import { useMemo } from 'react';
import { ParseError } from 'utils/parser';
import styles from 'styles/elements/main.module.scss';
import Link from 'next/link';

const validOptions = ['href'];
const validateOptions = (options) => {
    Object.keys(options).forEach((key) => {
        if (!validOptions.some((x) => x === key))
            throw new ParseError(`Unexpected link option: '${key}'`);
    });
}

/**
 * @param {{ options: Object.<string, string>, children: JSX.Element }} 
 * @returns {JSX.Element}
 */
const LinkElement = ({ options, children }) => {
    const href = useMemo(() => {
        try {
            if (!options.href) 
                return undefined;
            if (options.href.includes('http'))
                return new URL(options.href);
            if (/^[0-9a-f]{24}$/i.test(options.href))
                return new URL(location.href.replace(/[^/]*$/, options.href))
            return undefined;
        } catch (error) {
            console.warn("Invalid URL", options.href)
            return undefined;
        }
    }, [options]);

    return (
        <Link href={href}>
            <div className={styles.link}>
                { children }
            </div>
        </Link>
    )
}

/**
 * @type {Object.<string, RenderElement>}
 */
 export const element = {
    'link': {
        type: 'link',
        defaultKey: 'href',
        validOptions: validOptions,
        toComponent: LinkElement,
        validateOptions: validateOptions
    }
}

export default LinkElement;