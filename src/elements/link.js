import { useContext, useEffect, useMemo, useState } from 'react';
import { Context } from 'components/contexts/storyContext';
import { BuildAbility } from 'components/storyPage/renderer/ability';
import { BuildCharacter } from 'components/storyPage/renderer/character';
import { BuildCreature } from 'components/storyPage/renderer/creature';
import { BuildSpell } from 'components/storyPage/renderer/spell';
import { BuildDocument } from 'components/storyPage/renderer/document';
import { useMetadata } from 'utils/handleMetadata';
import Parser, { ParseError } from 'utils/parser';
import Navigation from 'utils/navigation';
import { FileType } from '@enums/database';
import styles from 'styles/elements/main.module.scss';

const validOptions1 = ['href'];
const validateOptions1 = (options) => {
    Object.keys(options).forEach((key) => {
        if (!validOptions1.some((x) => x === key))
            throw new ParseError(`Unexpected link option: '${key}'`);
    });
}

const validOptions2 = ['fileId', 'border'];
const validateOptions2 = (options) => {
    Object.keys(options).forEach((key) => {
        if (!validOptions2.some((x) => x === key))
            throw new ParseError(`Unexpected link option: '${key}'`);
    });
}

const LinkComponent = ({ href, className, children }) => {
    return href ? (
        <a href={href} className={className}>
            { children }
        </a>
    ) : (
        <div className={className}>
            { children }
        </div>
    )
}

/**
 * @param {{ options: Object.<string, string>, children: JSX.Element }} 
 * @returns {JSX.Element}
 */
export const LinkElement = ({ options = {}, children }) => {
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

/**
 * @param {{ options: Object.<string, string>, children: JSX.Element }} 
 * @returns {JSX.Element}
 */
export const LinkContentElement = ({ options = {} }) => {
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

    const [loaded, metadata, type] = useMetadata(context.story.id, options.fileId)
    const [content, setContent] = useState(null);
    const border = options.border ?? "true";

    useEffect(() => {
        if (loaded) {
            switch (type) {
                case FileType.Ability:
                    Parser.parse(metadata.description, {})
                    .then((res) => setContent(BuildAbility(metadata, {}, res)))
                    .catch(console.error);
                    break;
                case FileType.Creature:
                    setContent(BuildCreature(metadata))
                    break;
                case FileType.Character:
                    setContent(BuildCharacter(metadata))
                    break;
                case FileType.Spell:
                    setContent(BuildSpell(metadata))
                    break;
                default:
                    Parser.parse(metadata.content, {})
                    .then((res) => setContent(BuildDocument(metadata, res)))
                    .catch(console.error);
                    break;
            }
        }
    }, [metadata])

    if (!loaded) {
        return (
            <div className={styles.linkLoading} border={border}>
                Loading...
            </div>
        )
    }

    return (loaded && metadata) ? (
        <LinkComponent href={href} className={styles.linkContent}>
            <div border={border}>
                { content }
            </div>
        </LinkComponent>
    ) : <div className={styles.error}> Error </div>;
}

/**
 * @param {{ options: Object.<string, string>, children: JSX.Element }} 
 * @returns {JSX.Element}
 */
export const LinkTitleElement = ({ options }) => {
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

    const [loaded, metadata, type] = useMetadata(context.story.id, options.fileId);

    const title = useMemo(() => {
        if (!type)
            return null;
        switch (type) {
            case FileType.Ability:
            case FileType.Character:
            case FileType.Creature:
                return metadata.name;

            case FileType.Document:
            default:
                return metadata.title;
        }
    }, [type, metadata])

    return (!loaded || metadata) ? (
        <LinkComponent href={href} className={styles.link}>
            { title ?? 'Error' }
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