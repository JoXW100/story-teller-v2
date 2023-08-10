import React, { useContext } from 'react'
import { Context } from 'components/contexts/fileContext';
import ListMenu from 'components/common/controls/listMenu';
import { TemplateComponentProps } from '.';
import { getRelativeMetadata } from 'utils/helpers';
import { ListTemplateParams } from 'types/templates';
import styles from 'styles/pages/storyPage/editor.module.scss';

const ListComponent = ({ params }: TemplateComponentProps<ListTemplateParams>): JSX.Element => {
    const [context, dispatch] = useContext(Context)
    const metadata = getRelativeMetadata(context.file?.metadata, context.editFilePages)
    const values: (string | number)[] = (metadata && metadata[params.key]) ?? []
        
    const handleChange = (values: string[]) => {
        dispatch.setMetadata(params.key, values)
    }

    const handleValidate = (value: string | number): boolean => {
        return value && String(value).length > 0 && (params.type !== "number" || !isNaN(Number(value)))
    }

    return (
        <div className={styles.editList}>
            <b> {`${ params.label ?? "label"}:`} </b>
            <ListMenu
                itemClassName={styles.editListItem}
                values={Array.isArray(values) ? values : []}
                type={params.type}
                defaultValue={params.default}
                onChange={handleChange}
                validateInput={handleValidate}
                placeholder={params.placeholder}
                editEnabled={Boolean(params.editEnabled)}
                addLast={params.reverse}/>
        </div>
    )
}

export default ListComponent;