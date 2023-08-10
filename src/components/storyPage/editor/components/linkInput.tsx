import { useContext } from 'react'
import { Context } from 'components/contexts/fileContext';
import { TemplateComponentProps } from '.';
import { asEnum, getRelativeMetadata } from 'utils/helpers';
import { LinkInputTemplateParams } from 'types/templates';
import { ObjectId } from 'types/database';
import { FileType } from 'types/database/files';
import styles from 'styles/pages/storyPage/editor.module.scss';
import LinkInput from 'components/common/controls/linkInput';

const LinkInputComponent = ({ params }: TemplateComponentProps<LinkInputTemplateParams>): JSX.Element => {
    const [context, dispatch] = useContext(Context)
    const metadata = getRelativeMetadata(context.file?.metadata, context.editFilePages)
    const value: ObjectId = (metadata && metadata[params.key]) ?? params.default ?? ""

    const handleUpdate = (value: ObjectId) => {
        dispatch.setMetadata(params.key, value)
    }

    return (
        <div className={styles.editGroupItem}>
            <b> {`${ params.label ?? "label"}:`} </b>
            <LinkInput
                className={styles.editLinkItemHolder}
                value={value}
                placeholder={params.placeholder}
                fileTypes={params.fileTypes?.map((fileType) => asEnum(fileType, FileType)) ?? []}
                onUpdate={handleUpdate}/>
        </div>
    )
}

export default LinkInputComponent;