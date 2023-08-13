import React, { useContext } from 'react'
import { getRelativeMetadata } from 'utils/helpers';
import { Context } from 'components/contexts/fileContext';
import Checkbox from 'components/common/checkbox';
import { TemplateComponentProps } from '.';
import { BooleanTemplateParams } from 'types/templates';
import styles from 'styles/pages/storyPage/editor.module.scss'

const BooleanComponent = ({ params }: TemplateComponentProps<BooleanTemplateParams>): JSX.Element => {
    const [context, dispatch] = useContext(Context)
    const metadata = getRelativeMetadata(context.file?.metadata, context.editFilePages)
    const value: boolean = (metadata && metadata[params.key]) ?? params.default ?? 0

    const handleChange = (value: boolean) => {
        dispatch.setMetadata(params.key, Boolean(value));
    }

    return (
        <div className={styles.editBoolean}>
            <b> {`${params.label ?? "label"}:`} </b>
            <Checkbox value={value} onChange={handleChange} />
        </div>
    )
}
export default BooleanComponent;