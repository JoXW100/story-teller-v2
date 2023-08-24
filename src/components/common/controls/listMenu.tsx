import ListTemplateMenu, { ListTemplateComponent } from "./listTemplateMenu";
import styles from 'styles/components/listMenu.module.scss';

type ListMenuProps = React.PropsWithRef<{
    className?: string
    itemClassName?: string
    onChange: (selection: (string | number)[]) => void
    validateInput?: (value: string | number, values: (string | number)[]) => value is (string | number)
    values: (string | number)[]
    type: "text" | "number"
    defaultValue: string | number, 
    editEnabled: boolean,
    placeholder?: string
    addLast?: boolean
}>

const ListMenu = ({ className, itemClassName, onChange, validateInput, values = [], type = "text", defaultValue = "", editEnabled = false, placeholder, addLast }: ListMenuProps): JSX.Element => {
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

    const Component = ({ value }: ListTemplateComponent<string>): JSX.Element => {
        return (
            <div className={itemClassName}> 
                {value} 
            </div>
        )
    }
    
    return (
        <ListTemplateMenu<string | number>
            className={className}
            onChange={onChange}
            validateInput={validateInput}
            Component={editEnabled ? EditComponent : Component}
            EditComponent={EditComponent}
            defaultValue={defaultValue}
            values={values}
            addLast={addLast}/>
    )
}

export default ListMenu;