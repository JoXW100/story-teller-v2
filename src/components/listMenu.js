import ListTemplateMenu from "./listTemplateMenu";
import styles from 'styles/components/listMenu.module.scss';

/**
 * @param {[*]} a 
 * @param {[*]} b 
 * @returns {boolean}
 */
const arraysAreEqual = (a, b) => {
    if (a.length !== b.length)
        return false;
    
    for (let index = 0; index < a.length; index++) {
        if (a[index] !== b[index])
            return false;
    }

    return true;
}

/**
 * @param {{ 
 *  className: string,
 *  onChange=(selection: [string]) => void
 *  values: [string] 
 *  type: string,
 *  defaultValue: string, 
 *  editEnabled: boolean
 * }} 
 * @returns {JSX.Element}
 */
const ListMenu = ({ className, onChange, values = [], type = "text", defaultValue = "", editEnabled = false }) => {
    const toEditComponent = (item, handleChange) => {
        return (
            <input 
                className={styles.input} 
                value={item}
                type={type}
                onChange={(e) => handleChange(e.target.value)}
            />
        )
    }

    const toComponent = (item, handleChange) => {
        return editEnabled ? (
            toEditComponent(item, handleChange)
        ) : (
            <div className={styles.rowContent}>
                { item }
            </div>
        )
    }
    
    return (
        <ListTemplateMenu
            className={className}
            onChange={onChange}
            toComponent={toComponent}
            toEditComponent={toEditComponent}
            defaultValue={defaultValue}
            values={values}
        />
    )
}

export default ListMenu;