import React, { useContext } from 'react'
import Link from 'next/link';
import Navigation from 'utils/navigation';
import { Context } from 'components/contexts/fileContext';
import Checkbox from 'components/common/checkbox';
import { TemplateComponentProps } from '.';
import { BooleanTemplateParams } from 'types/templates';
import styles from 'styles/pages/storyPage/editor.module.scss'

const BooleanComponent = ({ params }: TemplateComponentProps<BooleanTemplateParams>): JSX.Element => {
    const [context, dispatch] = useContext(Context)
    const href = params.viewURL && Navigation.viewURL(context.file?.id)
    const defaultValue = params.default ?? 0;
    const value = context.file?.metadata 
        ? context.file.metadata[params.key] ?? defaultValue
        : defaultValue;

    const handleChange = (value: boolean) => {
        dispatch.setMetadata(params.key, Boolean(value));
    }

    return (
        <div className={styles.editBoolean}>
            <b> {`${params.label ?? "label"}:`} </b>
            <Checkbox value={value} onChange={handleChange} />
            { href && value ? <Link href={href}>{String(href)}</Link> : null  }
        </div>
    )
}
export default BooleanComponent;