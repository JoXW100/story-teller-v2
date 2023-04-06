import ListTemplateMenu, { ListTemplateComponent } from "./listTemplateMenu";
import styles from 'styles/components/listMenu.module.scss';

type ListMenuProps = React.PropsWithRef<{
    className?: string
    itemClassName?: string
    onChange: (selection: string[]) => void
    values: string[]
    type: string
    defaultValue: string | number, 
    editEnabled: boolean,
    placeholder?: string
}>

const ListMenu = ({ className, itemClassName, onChange, values = [], type = "text", defaultValue = "", editEnabled = false, placeholder }: ListMenuProps): JSX.Element => {
    const EditComponent = ({ value, onUpdate }: ListTemplateComponent<string>): JSX.Element => {
        const style = itemClassName ? `${itemClassName} ${styles.input}` : styles.input;
        return (
            <input 
                className={style} 
                value={value}
                type={type}
                placeholder={placeholder}
                onChange={(e) => onUpdate(e.target.value)}/>
        )
    }

    const Component = ({ value, onUpdate }: ListTemplateComponent<string>): JSX.Element => {
        const style = itemClassName ? `${itemClassName} ${styles.collection}` : styles.collection;
        return editEnabled ? (
            <EditComponent value={value} onUpdate={onUpdate}/>
        ) : (
            <div className={style}> {value} </div>
        )
    }
    
    return (
        <ListTemplateMenu<string | number>
            className={className}
            onChange={onChange}
            Component={Component}
            EditComponent={EditComponent}
            defaultValue={defaultValue}
            values={values}/>
    )
}

export default ListMenu;