import React, { useContext, useMemo } from 'react';
import { ParseError } from 'utils/parser';
import { Queries, IElementObject, ElementParams, Variables } from 'types/elements';
import styles from 'styles/elements.module.scss';
import { Context } from 'components/contexts/storyContext';
import { ILocalFile } from 'types/database/files';

interface ImageOptions extends Variables {
    href?: string
    width?: string
    border?: string
}

class Options implements ImageOptions {
    protected readonly options: ImageOptions;
    private readonly localFiles: Record<string, ILocalFile>

    constructor(options: ImageOptions, localFiles: Record<string, ILocalFile>) {
        this.options =  options ?? {}
        this.localFiles = localFiles
    }

    public get href(): string {
        return this.options.href ?? ""
    }

    public get hrefURL(): string {
        let match = /local\/(.+)/.exec(this.href)
        if (match && match[1] in this.localFiles) {
            return this.localFiles[match[1]].data as string
        } else if (this.href?.includes('http')) {
            return this.href
        }
        return undefined;
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
    const [context] = useContext(Context)
    const imageOptions = new Options(options, context.localFiles)

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
        validOptions: validOptions,
        toComponent: ImageElement,
        validate: validateOptions
    }
} satisfies Record<string, IElementObject>

export default ImageElement;