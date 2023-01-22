import ListTemplateMenu, { ListTemplateComponent } from "./listTemplateMenu";
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
    const EditComponent = ({ value, onUpdate }: ListTemplateComponent<string>): JSX.Element => {
        return (
            <input 
                className={styles.input} 
                value={value}
                type={type}
                placeholder={placeholder}
                onChange={(e) => onUpdate(e.target.value)}
            />
        )
    }

    const Component = ({ value, onUpdate }: ListTemplateComponent<string>): JSX.Element => {
        return editEnabled ? (
            <EditComponent value={value} onUpdate={onUpdate}/>
        ) : (
            <div className={styles.rowContent}>
                { value }
            </div>
        )
    }
    
    return (
        <ListTemplateMenu<string | number>
            className={className}
            onChange={onChange}
            Component={Component}
            EditComponent={EditComponent}
            defaultValue={defaultValue}
            values={values}
        />
    )
}

export default ListMenu;