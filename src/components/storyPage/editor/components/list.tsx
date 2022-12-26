import React, { useContext } from 'react'
import { Context } from 'components/contexts/fileContext';
import ListMenu from 'components/common/listMenu';
import { TemplateComponentProps } from '.';
import { ListTemplateParams } from 'types/templates';
import styles from 'styles/storyPage/editor.module.scss';

const ListComponent = ({ params }: TemplateComponentProps<ListTemplateParams>): JSX.Element => {
    const [context, dispatch] = useContext(Context)
    const values = context.file?.metadata[params.key] ?? []
        
    const handleChange = (values: string[]) => {
        dispatch.setMetadata(params.key, values)
    }

    return (
        <div className={styles.editList}>
            <b> {`${ params.label ?? "label"}:`} </b>
            <ListMenu
                className={styles.list}
                values={typeof values === 'object' ? values : []}
                type={params.type}
                defaultValue={params.default}
                onChange={handleChange}
                editEnabled={Boolean(params.editEnabled)}
            />
        </div>
    )
}

export default ListComponent;