import { ParseError } from 'utils/parser';
import { Queries, ElementObject, ElementParams, Variables } from 'types/elements';
import styles from 'styles/elements/main.module.scss';

interface HeaderOptions extends Variables {
    underline?: string
}


const validOptions = new Set(['underline']);
const validateOptions = (options: Variables): Queries => {
    Object.keys(options).forEach((key) => {
        if (!validOptions.has(key))
            throw new ParseError(`Unexpected header option: '${key}'`);
    });
    return {}
}

export const Header1 = ({ options = {}, children }: ElementParams<HeaderOptions>): JSX.Element => {
    return (
        <div 
            className={styles.header1}
            // @ts-ignore
            underline={options?.underline ?? "false"}
        > { children } </div>
    )
}

export const Header2 = ({ options = {}, children }: ElementParams<HeaderOptions>): JSX.Element => {
    return (
        <div 
            className={styles.header2} 
            // @ts-ignore
            underline={options?.underline ?? "false"}
        > { children } </div>
    )
}

export const Header3 = ({ options = {}, children }: ElementParams<HeaderOptions>): JSX.Element => {
    return (
        <div 
            className={styles.header3} 
            // @ts-ignore
            underline={options?.underline ?? "false"}
        > { children } </div>
    )
}

export const element: { [s: string]: ElementObject; } = {
    h1: {
        type: 'header',
        defaultKey: 'underline',
        validOptions: validOptions,
        toComponent: Header1,
        validate: validateOptions
    },
    h2: {
        type: 'header',
        defaultKey: 'underline',
        validOptions: validOptions,
        toComponent: Header2,
        validate: validateOptions
    },
    h3: {
        type: 'header',
        defaultKey: 'underline',
        validOptions: validOptions,
        toComponent: Header3,
        validate: validateOptions
    }
}