import React, { useContext } from 'react'
import LinkListMenu from 'components/common/linkListMenu';
import { Context } from 'components/contexts/fileContext';
import { TemplateComponentProps } from '.';
import { FileType } from 'types/database/files';
import { LinkListTemplateParams } from 'types/templates';
import styles from 'styles/pages/storyPage/editor.module.scss';

const LinkListComponent = ({ params }: TemplateComponentProps<LinkListTemplateParams>): JSX.Element => {
    const [context, dispatch] = useContext(Context)
    const values = context.file?.metadata[params.key] ?? []
        
    const handleChange = (values: string[]) => {
        dispatch.setMetadata(params.key, values)
    }

    return (
        <div className={styles.editList}>
            <b> {`${ params.label ?? "label"}:`} </b>
            <LinkListMenu
                itemClassName={styles.editListItem}
                values={typeof values === 'object' ? values : []}
                onChange={handleChange}
                placeholder={params.placeholder} 
                fileTypes={params.fileTypes?.map((fileType) => fileType as FileType ) ?? []}
                allowText={params.allowText}/>
        </div>
    )
}

export default LinkListComponent;