import React, { useContext } from 'react'
import Link from 'next/link';
import Navigation from 'utils/navigation';
import { Context } from 'components/contexts/fileContext';
import Checkbox from 'components/checkbox';
import styles from 'styles/storyPage/editor.module.scss'
import '@types/data';

/**
 * 
 * @param {{ children: JSX.Element, params: TextParams }} 
 * @returns {JSX.Element}
 */
const BooleanComponent = ({ params }) => {
    const [context, dispatch] = useContext(Context)
    const href = params.viewURL && Navigation.ViewURL(context.file?.id)
    const defaultValue = params.default ?? 0;
    const value = context.file?.metadata 
        ? context.file.metadata[params.key] ?? defaultValue
        : defaultValue;

    /** @param {boolean} value */
    const handleChange = (value) => {
        dispatch.setMetadata(params.key, Boolean(value));
    }

    return (
        <div className={styles.editText}>
            <b> {`${ params.label ?? "label"}:`} </b>
            <Checkbox className={styles.checkbox} value={value} onChange={handleChange} />
            { href && value ? <Link href={href} children={String(href)}/> : null  }
        </div>
    )
}
export default BooleanComponent;