import { useMemo } from 'react';
import Link from 'next/link';
import { ParseError } from 'utils/parser';
import Navigation from 'utils/navigation';
import EncounterRenderer from 'components/renderer/encounter';
import { AbilityRenderer, CharacterRenderer, CreatureRenderer, SpellRenderer, DocumentRenderer } from 'components/renderer';
import { Queries, QueryType, ElementObject, ElementParams, Variables } from 'types/elements';
import { FileContent, FileMetadata, FileType } from 'types/database/files';
import { RendererObject } from 'types/database/editor';
import styles from 'styles/elements.module.scss';

type LinkParams = React.PropsWithChildren<{
    href?: URL
    className: string
}>

class Options implements LinkOptions, LinkContentOptions, LinkTitleOptions {
    protected readonly options: LinkOptions | LinkContentOptions | LinkTitleOptions;
    [key: string]: any

    constructor(options: LinkOptions | LinkContentOptions | LinkTitleOptions) {
        this.options =  options ?? {}
    }

    public get href(): string {
        return this.options.href ?? this.options.fileId ?? ""
    }

    public get fileId(): string {
        return this.options.fileId ?? this.options.href ?? ""
    }

    public get border(): string {
        return this.options.border == "true" 
            ? "true"
            : "false"
    }
}

interface LinkOptions extends Variables {
    href?: string
} 

interface LinkContentOptions extends Variables {
    fileId?: string
    border?: string
}

interface LinkTitleOptions extends Variables {
    fileId?: string
} 

const validOptions1 = new Set(['href']);
const validateOptions1 = (options: LinkOptions): Queries => {
    Object.keys(options).forEach((key) => {
        if (!validOptions1.has(key))
            throw new ParseError(`Unexpected link option: '${key}'`);
    });
    return {}
}

const validOptions2 = new Set(['fileId', 'border']);
const validateOptions2 = (options: LinkContentOptions): Queries => {
    Object.keys(options).forEach((key) => {
        if (!validOptions2.has(key))
            throw new ParseError(`Unexpected link option: '${key}'`);
    });
    return options?.fileId 
        ? { [options.fileId]: QueryType.Content }
        : {}
}

const validOptions3 = new Set(['fileId']);
const validateOptions3 = (options: LinkTitleOptions): Queries => {
    Object.keys(options).forEach((key) => {
        if (!validOptions3.has(key))
            throw new ParseError(`Unexpected link option: '${key}'`);
    });
    return options?.fileId 
        ? { [options.fileId]: QueryType.Title }
        : {}
}

export const LinkElement = ({ options, children }: ElementParams<LinkOptions>): JSX.Element => {
    const linkOptions = new Options(options)
    const href = useMemo(() => {
        try {
            if (linkOptions.href.includes('http'))
                return new URL(linkOptions.href);
            if (/^[0-9a-f]{24}$/i.test(linkOptions.href))
                return Navigation.fileURL(linkOptions.href)
            return undefined;
        } catch (error) {
            console.warn("Invalid URL", linkOptions.href)
            return undefined;
        }
    }, [options]);

    return  (
        <LinkComponent href={href} className={styles.link}>
            { children }
        </LinkComponent>
    );
}

export const LinkContentElement = ({ options = {}, metadata }: ElementParams<LinkContentOptions>): JSX.Element => {
    const linkOptions = new Options(options)
    const file = metadata.$queries[linkOptions.fileId]
    const href: URL = useMemo(() => {
        try {
            if (/^[0-9a-f]{24}$/i.test(linkOptions.href))
                return Navigation.fileURL(linkOptions.href)
            return undefined;
        } catch (error) {
            console.error(error)
            console.warn("Invalid URL", linkOptions.href)
            return undefined;
        }
    }, [options.fileId]);

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
            case FileType.Encounter:
                return EncounterRenderer
            default:
                return DocumentRenderer
        }
    }, [file])

    return href && file ? (
        <LinkComponent href={href} className={styles.linkContent}>
            <div data={linkOptions.border}>
                <Content.linkRenderer file={file}/>
            </div>
        </LinkComponent>
    ) : <LinkError/>;
}

export const LinkTitleElement = ({ options, metadata }: ElementParams<LinkTitleOptions>): JSX.Element => {
    const linkOptions = new Options(options)
    const href = useMemo(() => {
        try {
            if (/^[0-9a-f]{24}$/i.test(linkOptions.href))
                return Navigation.fileURL(linkOptions.href)
            return undefined;
        } catch (error) {
            console.warn("Invalid URL", linkOptions.href)
            return undefined;
        }
    }, [options]);

    const title = useMemo(() => {
        var data = metadata.$queries[linkOptions.fileId]
        switch (data?.type) {
            case FileType.Ability:
            case FileType.Character:
            case FileType.Creature:
            case FileType.Encounter:
                return data?.metadata.name ?? null;
            case FileType.Document:
            default:
                return data?.metadata.title ?? null;
        }
    }, [options.fileId, metadata.$queries[linkOptions.fileId]])

    return href ? (
        <LinkComponent href={href} className={styles.link}>
            { title ?? 'Missing Title' }
        </LinkComponent>
    ) : <LinkError/>
}

const LinkError = () => (
    <span className={styles.error}> Error </span>
)

const LinkComponent = ({ href, className, children }: LinkParams): JSX.Element => {
    return href ? (
        <Link href={href} className={className} passHref>
            { children }
        </Link>
    ) : (
        <span className={className}>
            { children }
        </span>
    )
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