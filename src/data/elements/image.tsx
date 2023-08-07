import React, { useMemo } from 'react';
import { ParseError } from 'utils/parser';
import { Queries, ElementObject, ElementParams, Variables } from 'types/elements';
import styles from 'styles/elements.module.scss';

interface ImageOptions extends Variables {
    href?: string
    width?: string
    border?: string
}

class Options implements ImageOptions {
    protected readonly options: ImageOptions;
    [key: string]: any

    constructor(options: ImageOptions) {
        this.options =  options ?? {}
    }

    public get href(): string {
        return this.options.href ?? ""
    }

    public get hrefURL(): string {
        try {
            return this.href.includes('http') ? this.href : undefined;
        } catch (error) {
            return undefined;
        }
    }

    public get width(): string {
        return this.options.width ?? '100%'
    }

    public get flex(): number {
        return this.width == '100%' ? 1 : undefined
    }

    public get border(): string {
        return this.options.border == "true" 
            ? 'true'
            : 'false'
    }

    public get borderValue(): string {
        return this.options.border == "true" 
            ? 'border'
            : undefined
    }
}

const validOptions = new Set(['href', 'width', 'border']);
const validateOptions = (options: ImageOptions): Queries => {
    Object.keys(options).forEach((key) => {
        if (!validOptions.has(key))
            throw new ParseError(`Unexpected link option: '${key}'`);
    });

    if (options.border) {
        if (options.border !== 'true' && options.border != 'false')
            throw new ParseError(`Invalid image option value. border: '${options.border}', must be true or false`);
    }
    return {}
}

const ImageElement = ({ options = {} }: ElementParams<ImageOptions>): JSX.Element => {
    const imageOptions = new Options(options)

    return (
        <div
            className={styles.image} 
            style={{ width: imageOptions.width, flex: imageOptions.flex }}
            data={imageOptions.borderValue}>
            <img src={imageOptions.hrefURL ?? '/defaultImage.jpg'} alt='/defaultImage.jpg'/>
        </div>
    )
}

export const element = {
    'image': {
        type: 'image',
        defaultKey: 'href',
        buildChildren: false,
        inline: false,
        lineBreak: true,
        container: false,
        toComponent: ImageElement,
        validate: validateOptions
    }
} satisfies Record<string, ElementObject>

export default ImageElement;