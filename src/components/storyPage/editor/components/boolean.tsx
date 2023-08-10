import React, { useContext } from 'react'
import Link from 'next/link';
import Navigation from 'utils/navigation';
import { getRelativeMetadata } from 'utils/helpers';
import { Context } from 'components/contexts/fileContext';
import Checkbox from 'components/common/checkbox';
import { TemplateComponentProps } from '.';
import { BooleanTemplateParams } from 'types/templates';
import styles from 'styles/pages/storyPage/editor.module.scss'

const BooleanComponent = ({ params }: TemplateComponentProps<BooleanTemplateParams>): JSX.Element => {
    const [context, dispatch] = useContext(Context)
    const href = params.viewURL && Navigation.viewURL(context.file?.id)
    const metadata = getRelativeMetadata(context.file?.metadata, context.editFilePages)
    const value: boolean = (metadata && metadata[params.key]) ?? params.default ?? 0

    const handleChange = (value: boolean) => {
        dispatch.setMetadata(params.key, Boolean(value));
    }

    return (
        <div className={styles.editBoolean}>
            <b> {`${params.label ?? "label"}:`} </b>
            <Checkbox value={value} onChange={handleChange} />
            { href && value ? (
                <Link href={href}>
                    <button className={styles.linkHolder}>
                        {String(href)}
                    </button> 
                </Link>
            ) : null}
        </div>
    )
}
export default BooleanComponent;