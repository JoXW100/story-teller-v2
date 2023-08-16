import { useMemo } from 'react';
import Link from 'next/link';
import { ParseError } from 'utils/parser';
import Navigation from 'utils/navigation';
import EncounterRenderer from 'components/renderer/encounter';
import { AbilityRenderer, CharacterRenderer, CreatureRenderer, SpellRenderer, DocumentRenderer } from 'components/renderer';
import { Queries, QueryType, IElementObject, ElementParams, Variables } from 'types/elements';
import { FileType } from 'types/database/files';
import { RendererObject } from 'types/database/editor';
import styles from 'styles/elements.module.scss';
import Logger from 'utils/logger';
import { isObjectId } from 'utils/helpers';

type LinkParams = React.PropsWithChildren<{
    href?: URL,
    newTab: boolean,
    className: string
}>

interface LinkOptions extends Variables {
    href?: string,
    newTab?: string
} 

interface LinkContentOptions extends Variables {
    fileId?: string
    border?: string,
    newTab?: string
}

interface LinkTitleOptions extends Variables {
    fileId?: string,
    newTab?: string
} 

class Options implements LinkOptions, LinkContentOptions, LinkTitleOptions {
    protected readonly options: LinkOptions | LinkContentOptions | LinkTitleOptions;

    constructor(options: LinkOptions | LinkContentOptions | LinkTitleOptions) {
        this.options =  options ?? {}
    }

    public get href(): string {
        return this.options.href ?? this.options.fileId ?? ""
    }

    public get fileId(): string {
        return this.options.fileId ?? this.options.href ?? ""
    }

    public get hrefURL(): URL {
        try {
            if (this.href.includes('http'))
                return new URL(this.href);
            if (isObjectId(this.href))
                return Navigation.fileURL(this.href)
            return undefined;
        } catch (error) {
            Logger.warn("Options.hrefURL", this.href);
            return undefined;
        }
    }

    public get fileURL(): URL {
        try {
            if (isObjectId(this.fileId))
                return Navigation.fileURL(this.fileId)
            return undefined;
        } catch (error) {
            Logger.warn("Options.fileURL", this.fileId);
            return undefined;
        }
    }

    public get border(): string {
        return this.options.border?.toLowerCase() == "true" ? "true" : "false"
    }

    public get newTab(): string {
        return this.options.newTab?.toLowerCase() == "true" ? "true" : "false"
    }

    public get newTabValue(): boolean {
        return this.newTab == "true"
    }
}

const validOptions1 = new Set(['href', 'newTab']);
const validateOptions1 = (options: LinkOptions): Queries => {
    Object.keys(options).forEach((key) => {
        if (!validOptions1.has(key))
            throw new ParseError(`Unexpected link option: '${key}'`);
    });
    return {}
}

const validOptions2 = new Set(['fileId', 'border', 'newTab']);
const validateOptions2 = (options: LinkContentOptions): Queries => {
    Object.keys(options).forEach((key) => {
        if (!validOptions2.has(key))
            throw new ParseError(`Unexpected link option: '${key}'`);
    });
    return options?.fileId 
        ? { [options.fileId]: QueryType.Content }
        : {}
}

const validOptions3 = new Set(['fileId', 'newTab']);
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
    return  (
        <LinkComponent 
            className={styles.link} 
            href={linkOptions.hrefURL} 
            newTab={linkOptions.newTabValue}>
            { children }
        </LinkComponent>
    );
}

export const LinkContentElement = ({ options = {}, metadata }: ElementParams<LinkContentOptions>): JSX.Element => {
    const linkOptions = new Options(options)
    const href = linkOptions.fileURL
    const file = metadata.$queries[linkOptions.fileId]

    const Content = useMemo<RendererObject>(() => {
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
            case FileType.Document:
            default:
                return DocumentRenderer
        }
    }, [file])

    return href && file ? (
        <LinkComponent 
            className={styles.linkContent} 
            href={href} 
            newTab={linkOptions.newTabValue}>
            <div data={linkOptions.border}>
                <Content.linkRenderer file={file}/>
            </div>
        </LinkComponent>
    ) : <LinkError/>;
}

export const LinkTitleElement = ({ options, metadata }: ElementParams<LinkTitleOptions>): JSX.Element => {
    const linkOptions = new Options(options)
    const href = linkOptions.fileURL
    const data = metadata.$queries[linkOptions.fileId]
    const title = data?.metadata?.name ?? null
    return href ? (
        <LinkComponent 
            className={styles.linkTitle} 
            href={href} 
            newTab={linkOptions.newTabValue}>
            { title ?? 'Missing Title' }
        </LinkComponent>
    ) : <LinkError/>
}

const LinkError = () => (
    <span className={styles.error}> Error </span>
)

const LinkComponent = ({ href, newTab, className, children }: LinkParams): JSX.Element => {
    let rel = newTab ? "noopener noreferrer" : undefined
    let target = newTab ? "_blank" : undefined
    return href ? (
        <Link href={href} className={className} target={target} rel={rel} passHref>
            { children }
        </Link>
    ) : (
        <span className={className}>
            { children }
        </span>
    )
}

export const element = {
    link: {
        type: 'link',
        defaultKey: 'href',
        buildChildren: true,
        validOptions: validOptions1,
        toComponent: LinkElement,
        validate: validateOptions1
    },
    linkContent: {
        type: 'linkContent',
        defaultKey: 'fileId',
        buildChildren: false,
        validOptions: validOptions2,
        toComponent: LinkContentElement,
        validate: validateOptions2
    },
    linkTitle: {
        type: 'linkTitle',
        defaultKey: 'fileId',
        buildChildren: false,
        validOptions: validOptions3,
        toComponent: LinkTitleElement,
        validate: validateOptions3
    }
} satisfies Record<string, IElementObject>