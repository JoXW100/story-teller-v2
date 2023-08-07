import { ReactNode } from 'react';
import { ParseError } from 'utils/parser';
import { Queries, ElementObject, ElementParams, Variables } from 'types/elements';
import styles from 'styles/elements.module.scss';

interface HeaderOptions extends Variables {
    underline?: string
}

class Options implements HeaderOptions {
    protected readonly options: HeaderOptions;
    [key: string]: any

    constructor(options: HeaderOptions) {
        this.options =  options ?? {}
    }

    public get underline(): string {
        return this.options.underline ?? "false"
    }

    public get underlineValue(): boolean {
        return this.options.underline == "true"
    }
}

const validOptions = new Set(['underline']);
const validateOptions = (options: HeaderOptions): Queries => {
    Object.keys(options).forEach((key) => {
        if (!validOptions.has(key))
            throw new ParseError(`Unexpected header option: '${key}'`);
    });
    return {}
}

const GetHeader = (options: HeaderOptions, children: ReactNode, className: string): JSX.Element => {
    const headerOptions = new Options(options)
    return (
        <div 
            className={className}
            data={headerOptions.underlineValue ? "underline" : undefined}
        > { children } </div>
    )
} 

export const Header1 = ({ options = {}, children }: ElementParams<HeaderOptions>): JSX.Element => (
    GetHeader(options, children, styles.header1)
)

export const Header2 = ({ options = {}, children }: ElementParams<HeaderOptions>): JSX.Element => (
    GetHeader(options, children, styles.header2)
)

export const Header3 = ({ options = {}, children }: ElementParams<HeaderOptions>): JSX.Element => (
    GetHeader(options, children, styles.header3)
)


export const element = {
    h1: {
        type: 'header',
        defaultKey: 'underline',
        buildChildren: true,
        inline: false,
        lineBreak: true,
        container: false,
        toComponent: Header1,
        validate: validateOptions
    },
    h2: {
        type: 'header',
        defaultKey: 'underline',
        buildChildren: true,
        inline: false,
        lineBreak: true,
        container: false,
        toComponent: Header2,
        validate: validateOptions
    },
    h3: {
        type: 'header',
        defaultKey: 'underline',
        buildChildren: true,
        inline: false,
        lineBreak: true,
        container: false,
        toComponent: Header3,
        validate: validateOptions
    }
} satisfies Record<string, ElementObject>