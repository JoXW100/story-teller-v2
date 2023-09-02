import { useContext } from 'react'
import RemoveIcon from '@mui/icons-material/Remove';
import { Context } from 'components/contexts/fileContext';
import LinkInput from 'components/common/controls/linkInput';
import { TemplateComponentProps } from '.';
import { asEnum, getRelativeMetadata } from 'utils/helpers';
import { LinkInputTemplateParams } from 'types/templates';
import { FileType } from 'types/database/files';
import { ObjectId } from 'types/database';
import { FileGetMetadataResult } from 'types/database/responses';
import styles from 'styles/pages/storyPage/editor.module.scss';

const LinkInputComponent = ({ params }: TemplateComponentProps<LinkInputTemplateParams>): JSX.Element => {
    const [context, dispatch] = useContext(Context)
    const metadata = getRelativeMetadata(context.file?.metadata, context.editFilePages)
    const value: ObjectId = metadata?.[params.key] ?? params.default ?? null

    const handleChange = (value: FileGetMetadataResult) => {
        dispatch.setMetadata(params.key, value.id)
    }

    const handleClick = () => {
        dispatch.setMetadata(params.key, null)
    }

    return (
        <div className={styles.editGroupItem}>
            <b>{`${ params.label ?? "label"}:`}</b>
            <div className={styles.editLinkItemHolder}>
                <LinkInput
                    className={styles.editInput}
                    value={value}
                    placeholder={params.placeholder}
                    allowedTypes={params.fileTypes?.map((fileType) => asEnum(fileType, FileType)) ?? []}
                    onChange={handleChange}
                    disabled={value !== null}/>
                { value !== null &&
                    <button onClick={handleClick}>
                        <RemoveIcon/>
                    </button>
                }
            </div>
        </div>
    )
}

export default LinkInputComponent;