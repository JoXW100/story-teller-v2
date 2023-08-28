import ListTemplateMenu, { ListTemplateComponent } from "./listTemplateMenu";
import styles from 'styles/components/listMenu.module.scss';

type ListMenuProps = React.PropsWithRef<{
    className?: string
    itemClassName?: string
    values: (string | number)[]
    type: "text" | "number"
    defaultValue: string | number, 
    editEnabled: boolean,
    placeholder?: string
    addLast?: boolean
    onChange: (selection: (string | number)[]) => void
    validateInput?: (value: string | number, values: (string | number)[]) => value is (string | number)
}>

type ListMenuComponentParams = {
    itemClassName: string
    placeholder: string
    type: string
}

const ListMenu = ({ className, itemClassName, values = [], type = "text", defaultValue = "", editEnabled = false, placeholder, addLast, onChange, validateInput }: ListMenuProps): JSX.Element => {
    
    return (
        <ListTemplateMenu<string | number, ListMenuComponentParams>
            className={className}
            onChange={onChange}
            validateInput={validateInput}
            Component={editEnabled ? EditComponent : Component}
            EditComponent={EditComponent}
            defaultValue={defaultValue}
            values={values}
            addLast={addLast}
            params={{ itemClassName: itemClassName, placeholder: placeholder, type: type }}/>
    )
}

const Component = ({ value, params }: ListTemplateComponent<string, ListMenuComponentParams>): JSX.Element => {
    return (
        <div className={params.itemClassName}> 
            {value} 
        </div>
    )
}

const EditComponent = ({ value, onUpdate, params }: ListTemplateComponent<string, ListMenuComponentParams>): JSX.Element => {
    const { itemClassName, placeholder, type } = params
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

export default ListMenu;