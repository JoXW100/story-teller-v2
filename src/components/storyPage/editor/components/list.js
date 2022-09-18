import React, { useContext } from 'react'
import { Context } from 'components/contexts/fileContext';
import ListMenu from 'components/listMenu';
import styles from 'styles/storyPage/editor.module.scss';
import '@types/data';

/**
 * 
 * @param {{ params: ListParams }} 
 * @returns {JSX.Element}
 */
const ListComponent = ({ params }) => {
    const [context, dispatch] = useContext(Context)
    const values = context.file?.metadata[params.key] ?? []
        
    /** @param {[string]} values */
    const handleChange = (values) => {
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
            />
        </div>
    )
}

export default ListComponent;