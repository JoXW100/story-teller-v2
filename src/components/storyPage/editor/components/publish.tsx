import React, { useContext } from 'react'
import Link from 'next/link';
import Navigation from 'utils/navigation';
import { Context } from 'components/contexts/fileContext';
import Checkbox from 'components/common/checkbox';
import { TemplateComponentProps } from '.';
import { IFileTemplateParams } from 'types/templates';
import styles from 'styles/pages/storyPage/editor.module.scss'

const PublishComponent = ({ params }: TemplateComponentProps<IFileTemplateParams>): JSX.Element => {
    const [context, dispatch] = useContext(Context)
    const href = Navigation.viewURL(context.file?.id)

    const handleChange = (value: boolean) => {
        dispatch.setPublic(value)
    }

    return (
        <div className={styles.editBoolean}>
            <b> {`${params.label ?? "Publish"}:`} </b>
            <Checkbox value={context.file?.content.public} onChange={handleChange} />
            { context.file?.content.public &&
                <Link href={href}>
                    <button className={styles.linkHolder}>
                        {String(href)}
                    </button> 
                </Link>
            }
        </div>
    )
}
export default PublishComponent;