import React, { useContext } from 'react'
import LinkListMenu from 'components/common/controls/linkListMenu';
import { Context } from 'components/contexts/fileContext';
import { TemplateComponentProps } from '.';
import { isValidAbilityFormat } from 'utils/importers/stringFormatAbilityImporter';
import { asEnum, getRelativeMetadata, isObjectId } from 'utils/helpers';
import { FileType } from 'types/database/files';
import { LinkListTemplateParams } from 'types/templates';
import { ObjectId, ObjectIdText } from 'types/database';
import styles from 'styles/pages/storyPage/editor.module.scss';

const LinkListComponent = ({ params }: TemplateComponentProps<LinkListTemplateParams>): JSX.Element => {
    const [context, dispatch] = useContext(Context)
    const metadata = getRelativeMetadata(context.file?.metadata, context.editFilePages)
    const values: ObjectId[] = metadata?.[params.key] ?? []
        
    const handleChange = (values: ObjectId[]) => {
        dispatch.setMetadata(params.key, values)
    }

    const handleValidate = (value: ObjectIdText): value is ObjectId => {
        return isObjectId(value) || (params.allowText && isValidAbilityFormat(value))
    }

    return (
        <div className={styles.editList} data={params.fill && "fill"}>
            <b>{`${ params.label ?? "label"}:`}</b>
            <LinkListMenu
                itemClassName={styles.editListItem}
                editClassName={styles.itemListItem}
                values={Array.isArray(values) ? values : []}
                onChange={handleChange}
                validateInput={handleValidate}
                placeholder={params.placeholder} 
                allowedTypes={params.fileTypes?.map((fileType) => asEnum(fileType, FileType))}
                allowText={params.allowText}/>
        </div>
    )
}

export default LinkListComponent;