import React, { useMemo } from 'react';
import { ParseError } from 'utils/parser';
import styles from 'styles/elements/main.module.scss';

const validOptions = ['href', 'width', 'border'];
const validateOptions = (options) => {
    Object.keys(options).forEach((key) => {
        if (!validOptions.some((x) => x === key))
            throw new ParseError(`Unexpected link option: '${key}'`);
    });

    if (options.border) {
        if (options.border !== 'true' && options.border != 'false')
            throw new ParseError(`Invalid image option value. border: '${options.border}', must be true or false`);
    }
}

/**
 * @param {{ options: Object.<string, string>, children: JSX.Element }} 
 * @returns {JSX.Element}
 */
const ImageElement = ({ options }) => {
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

    const border = options.border ?? "false";
    const width = options.width ?? "100%";

    return (
        <div
            className={styles.image} 
            style={{ width: width, flex: width == '100%' ? 1 : undefined }}
            border={border}
        >
            <img src={href ?? '/defaultImage.jpg'}/>
        </div>
    )
}

/**
 * @type {Object.<string, RenderElement>}
 */
 export const element = {
    'image': {
        type: 'image',
        defaultKey: 'href',
        validOptions: validOptions,
        toComponent: ImageElement,
        validateOptions: validateOptions
    }
}

export default ImageElement;