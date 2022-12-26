import React, { useMemo } from 'react';
import { ParseError } from 'utils/parser';
import { Queries, ElementObject, ElementParams, Variables } from 'types/elements';
import styles from 'styles/elements.module.scss';

interface ImageOptions extends Variables {
    href?: string
    width?: string
    border?: string
}

const validOptions = new Set(['href', 'width', 'border']);
const validateOptions = (options: Variables): Queries => {
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
    const href = useMemo(() => {
        try {
            if (!options.href) 
                return undefined;
            if (options.href.includes('http'))
                return new URL(options.href);
            return undefined;
        } catch (error) {
            return undefined;
        }
    }, [options]);

    const width = options.width ?? "100%";

    return (
        <div
            className={styles.image} 
            style={{ width: width, flex: width == '100%' ? 1 : undefined }}
            data={options.border == "border" ? "border" : undefined }
        >
            <img src={href ? String(href) : '/defaultImage.jpg'}/>
        </div>
    )
}

export const element: { [s: string]: ElementObject } = {
    'image': {
        type: 'image',
        defaultKey: 'href',
        validOptions: validOptions,
        toComponent: ImageElement,
        validate: validateOptions
    }
}

export default ImageElement;