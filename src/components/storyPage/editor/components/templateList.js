import React, { useContext } from 'react'
import { Context } from 'components/contexts/fileContext';
import { buildEditor } from '../editor';
import styles from 'styles/storyPage/editor.module.scss';
import '@types/data';
import ListTemplateMenu from 'components/listTemplateMenu';

/**
 * 
 * @param {{ params: TemplateListParams }} 
 * @returns {JSX.Element}
 */
const TemplateListComponent = ({ params }) => {
    const [context, dispatch] = useContext(Context)
    const values = context.file?.metadata[params.key] ?? []
        
    /** @param {[string]} values */
    const handleChange = (values) => {
        dispatch.setMetadata(params.key, values)
    }
    
    const toComponent = (value, handleChange) => {
        return buildEditor(params.template, value)
    }

    return (
        <div className={styles.editTemplateList}>
            <b> {`${ params.label ?? "label"}:`} </b>
            <ListTemplateMenu
                className={styles.editTemplateListMenu}
                onChange={handleChange}
                toComponent={toComponent}
                toEditComponent={toComponent}
                defaultValue={{}}
                values={values}
            />
        </div>
    )
}

export default TemplateListComponent;