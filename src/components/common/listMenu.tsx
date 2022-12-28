import ListTemplateMenu from "./listTemplateMenu";
import styles from 'styles/components/listMenu.module.scss';

type ListMenuProps = React.PropsWithRef<{
    className: string
    onChange: (selection: string[]) => void
    values: string[]
    type: string
    defaultValue: string | number, 
    editEnabled: boolean,
    placeholder?: string
}>

const ListMenu = ({ className, onChange, values = [], type = "text", defaultValue = "", editEnabled = false, placeholder }: ListMenuProps): JSX.Element => {
    const toEditComponent = (item: string, handleChange: (value: string) => void) => {
        return (
            <input 
                className={styles.input} 
                value={item}
                type={type}
                placeholder={placeholder}
                onChange={(e) => handleChange(e.target.value)}
            />
        )
    }

    const toComponent = (item: string, handleChange: (value: string) => void) => {
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