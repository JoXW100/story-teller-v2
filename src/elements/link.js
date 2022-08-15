import { useContext, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Context } from 'components/contexts/storyContext';
import { useMetadata } from 'utils/handleMetadata';
import Parser, { ParseError } from 'utils/parser';
import Navigation from 'utils/navigation';
import styles from 'styles/elements/main.module.scss';

const validOptions1 = ['href'];
const validateOptions1 = (options) => {
    Object.keys(options).forEach((key) => {
        if (!validOptions1.some((x) => x === key))
            throw new ParseError(`Unexpected link option: '${key}'`);
    });
}

const validOptions2 = ['fileId'];
const validateOptions2 = (options) => {
    Object.keys(options).forEach((key) => {
        if (!validOptions2.some((x) => x === key))
            throw new ParseError(`Unexpected link option: '${key}'`);
    });
}

const LinkComponent = ({ href, className, children }) => {
    return href ? (
        <Link href={href}>
            <span className={className}>
                { children }
            </span>
        </Link>
    ) : (
        <span className={className}>
            { children }
        </span>
    )
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
                return Navigation.FileURL(options.href)
            return undefined;
        } catch (error) {
            console.warn("Invalid URL", options.href)
            return undefined;
        }
    }, [options]);

    return  (
        <LinkComponent href={href} className={styles.link}>
            { children }
        </LinkComponent>
    );
}

const LinkContentElement = ({ options }) => {
    const [context] = useContext(Context);
    const href = useMemo(() => {
        try {
            if (!options.fileId) 
                return undefined;
            if (/^[0-9a-f]{24}$/i.test(options.fileId))
                return Navigation.FileURL(options.fileId)
            return undefined;
        } catch (error) {
            console.warn("Invalid URL", options.fileId)
            return undefined;
        }
    }, [options]);

    const [loaded, metadata] = useMetadata(context.story.id, options.fileId)
    const [content, setContent] = useState(null);

    useEffect(() => {
        if (loaded && metadata?.content) {
            Parser.parse(metadata.content, {})
            .then((res) => setContent(res))
            .catch(console.error);
        }
        else {
            setContent(null)
        }
    }, [metadata])

    return (!loaded || metadata?.title) ? (
        <LinkComponent href={href} className={styles.linkContent}>
            <div>
                <h3 className={styles.header}> 
                    { metadata?.title ?? 'Loading...' } 
                </h3>
                { content }
            </div>
        </LinkComponent>
    ) : <div className={styles.error}> Error </div>;
}

const LinkTitleElement = ({ options }) => {
    const [context] = useContext(Context);
    const href = useMemo(() => {
        try {
            if (!options.fileId) 
                return undefined;
            if (/^[0-9a-f]{24}$/i.test(options.fileId))
                return Navigation.FileURL(options.fileId)
            return undefined;
        } catch (error) {
            console.warn("Invalid URL", options.fileId)
            return undefined;
        }
    }, [options]);

    const [loaded, metadata] = useMetadata(context.story.id, options.fileId)

    return (!loaded || metadata) ? (
        <LinkComponent href={href} className={styles.link}>
            {metadata?.title ?? 'Error'}
        </LinkComponent>
    ) : <div className={styles.error}> Error </div>;
}

/**
 * @type {Object.<string, RenderElement>}
 */
export const element = {
    'link': {
        type: 'link',
        defaultKey: 'href',
        validOptions: validOptions1,
        toComponent: LinkElement,
        validateOptions: validateOptions1
    },
    'linkContent': {
        type: 'linkContent',
        defaultKey: 'fileId',
        validOptions: validOptions2,
        toComponent: LinkContentElement,
        validateOptions: validateOptions2
    },
    'linkTitle': {
        type: 'linkTitle',
        defaultKey: 'fileId',
        validOptions: validOptions2,
        toComponent: LinkTitleElement,
        validateOptions: validateOptions2
    }
}