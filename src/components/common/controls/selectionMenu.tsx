import DropdownMenu from "./dropdownMenu";
import ListTemplateMenu, { ListTemplateComponent } from "./listTemplateMenu";
import styles from 'styles/components/selectionMenu.module.scss';

type SelectionMenuProps = React.PropsWithRef<SelectionComponentParams>

type SelectionComponentParams = {
    className?: string
    componentClassName?: string
    dropdownClassName?: string
    dropdownItemClassName?: String
    values: Record<string, string | number> | string[]
    options: Record<string, React.ReactNode>
    editType?: string
    addLast?: boolean
    defaultValue?: string | number
    onChange: (selection: Record<string, string | number> | string[]) => void
}

const getFirstNotInCollection = (values: string[], collection: string[]): string => (
    values.find((key) => !collection.includes(key))
)

const SelectionMenu = (props: SelectionMenuProps) => {
    const { className, options, values, defaultValue = null, addLast = true, onChange } = props
    const style = className ? `${styles.list} ${className}` : styles.list
    const valuesIsList = Array.isArray(values)
    const valuesList = valuesIsList ? values : Object.keys(values)
    const defaultSelection = getFirstNotInCollection(Object.keys(options), valuesList)

    const handleValidateInput = (value: string): value is string => {
        return value != undefined;
    }

    const handleChange = (values: string[]) => {
        onChange(valuesIsList ? values : values.reduce((prev, value) => (
            { ...prev, [value]: values[value] ?? defaultValue }
        ), {}))
    }

    return (
        <ListTemplateMenu<string, SelectionComponentParams>
            className={style}
            defaultValue={defaultSelection}
            values={valuesList}
            addLast={addLast}
            params={props}
            onChange={handleChange}
            validateInput={handleValidateInput}
            Component={Component}
            EditComponent={EditComponent}/>
    )
}

const EditComponent = ({ value, params }: ListTemplateComponent<string, SelectionComponentParams>) => {
    const { dropdownClassName, dropdownItemClassName, values, options, defaultValue, onChange } = params
    const style = dropdownClassName ? `${styles.dropdown} ${dropdownClassName}` : styles.dropdown;
    const itemStyle = dropdownItemClassName ? `${styles.dropdownItem} ${dropdownItemClassName}` : styles.dropdownItem

    const handleChange = (newValue: string) => {
        let { value, ...rest } = values as Record<string, string | number>
        onChange({ ...rest, [newValue]: defaultValue })
    }

    return (
        <DropdownMenu 
            className={style}
            itemClassName={itemStyle}
            values={options}
            value={value}
            onChange={handleChange}/>
    )
}

const Component = ({ value, params }: ListTemplateComponent<string, SelectionComponentParams>): React.ReactNode => {
    const { componentClassName, values, options, editType = "none", onChange } = params
    const handleChange = (newValue: string) => {
        let res: string | number = newValue
        if (editType === "number") {
            res = parseInt(res)
            if (isNaN(res)) { res = 0 }
        }
        onChange(Array.isArray(values) 
            ? [ ...values, res as string ] 
            : { ...values, [value]: res })
    }

    return (
        <div className={componentClassName}>
            <b>{options[value]}</b>
            {editType !== "none" &&
                <input 
                    type={editType} 
                    value={values[value]} 
                    onChange={(e) => handleChange(e.target.value)}/>
            }
        </div>
    )
}

export default SelectionMenu;