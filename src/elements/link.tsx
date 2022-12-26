import { useMemo } from 'react';
import Link from 'next/link';
import { ParseError } from 'utils/parser';
import Navigation from 'utils/navigation';
import { AbilityRenderer, CharacterRenderer, CreatureRenderer, SpellRenderer, DocumentRenderer } from 'components/renderer';
import { Queries, QueryType, ElementObject, ElementParams, Variables } from 'types/elements';
import { FileContent, FileMetadata, FileType } from 'types/database/files';
import { RendererObject } from 'types/database/editor';
import styles from 'styles/elements.module.scss';

const validOptions1 = new Set(['href']);
const validateOptions1 = (options: Variables): Queries => {
    Object.keys(options).forEach((key) => {
        if (!validOptions1.has(key))
            throw new ParseError(`Unexpected link option: '${key}'`);
    });
    return {}
}

const validOptions2 = new Set(['fileId', 'border']);
const validateOptions2 = (options: Variables): Queries => {
    Object.keys(options).forEach((key) => {
        if (!validOptions2.has(key))
            throw new ParseError(`Unexpected link option: '${key}'`);
    });
    return options?.fileId 
        ? { [options.fileId]: QueryType.Content }
        : {}
}

const validOptions3 = new Set(['fileId']);
const validateOptions3 = (options: Variables): Queries => {
    Object.keys(options).forEach((key) => {
        if (!validOptions3.has(key))
            throw new ParseError(`Unexpected link option: '${key}'`);
    });
    return options?.fileId 
        ? { [options.fileId]: QueryType.Title }
        : {}
}

type LinkParams = React.PropsWithChildren<{
    href?: URL
    className: string
}>

const LinkComponent = ({ href, className, children }: LinkParams): JSX.Element => {
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

interface LinkOptions extends Variables {
    href?: string
} 

export const LinkElement = ({ options, children }: ElementParams<LinkOptions>): JSX.Element => {
    const href = useMemo(() => {
        try {
            if (!options.href) 
                return undefined;
            if (options.href.includes('http'))
                return new URL(options.href);
            if (/^[0-9a-f]{24}$/i.test(options.href))
                return Navigation.fileURL(options.href)
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

interface LinkContentOptions extends Variables {
    fileId?: string
    border?: string
} 

export const LinkContentElement = ({ options = {}, metadata }: ElementParams<LinkContentOptions>): JSX.Element => {
    const file = metadata.$queries[options.fileId]
    const href = useMemo(() => {
        try {
            if (!options.fileId) 
                return undefined;
            if (/^[0-9a-f]{24}$/i.test(options.fileId))
                return Navigation.fileURL(options.fileId)
            return undefined;
        } catch (error) {
            console.error(error)
            console.warn("Invalid URL", options.fileId)
            return undefined;
        }
    }, [options.fileId, file]);

    const border = options.border ?? "true";

    const Content = useMemo<RendererObject<FileContent,FileMetadata>>(() => {
        switch (file?.type) {
            case FileType.Ability:
                return AbilityRenderer
            case FileType.Creature:
                return CreatureRenderer
            case FileType.Character:
                return CharacterRenderer
            case FileType.Spell:
                return SpellRenderer
            default:
                return DocumentRenderer
        }
    }, [file])

    return href && file ? (
        <LinkComponent href={href} className={styles.linkContent}>
            {/** @ts-ignore */}
            <div border={border}>
                <Content.linkRenderer file={file}/>
            </div>
        </LinkComponent>
    ) : <div className={styles.error}> Error </div>;
}

interface LinkTitleOptions extends Variables {
    fileId?: string
} 

export const LinkTitleElement = ({ options, metadata }: ElementParams<LinkTitleOptions>): JSX.Element => {
    const href = useMemo(() => {
        try {
            if (!options.fileId) 
                return undefined;
            if (/^[0-9a-f]{24}$/i.test(options.fileId))
                return Navigation.fileURL(options.fileId)
            return undefined;
        } catch (error) {
            console.warn("Invalid URL", options.fileId)
            return undefined;
        }
    }, [options]);

    const title = useMemo(() => {
        var data = metadata.$queries[options.fileId]
        switch (data?.type) {
            case FileType.Ability:
            case FileType.Character:
            case FileType.Creature:
                return data?.metadata.name ?? null;
            case FileType.Document:
            default:
                return data?.metadata.title ?? null;
        }
    }, [metadata.$queries[options.fileId]])

    return href ? (
        <LinkComponent href={href} className={styles.link}>
            { title ?? 'Error' }
        </LinkComponent>
    ) : <span className={styles.error}> Error </span>;
}

export const element: { [s: string]: ElementObject; } = {
    'link': {
        type: 'link',
        defaultKey: 'href',
        validOptions: validOptions1,
        toComponent: LinkElement,
        validate: validateOptions1
    },
    'linkContent': {
        type: 'linkContent',
        defaultKey: 'fileId',
        validOptions: validOptions2,
        toComponent: LinkContentElement,
        validate: validateOptions2
    },
    'linkTitle': {
        type: 'linkTitle',
        defaultKey: 'fileId',
        validOptions: validOptions3,
        toComponent: LinkTitleElement,
        validate: validateOptions3
    }
}