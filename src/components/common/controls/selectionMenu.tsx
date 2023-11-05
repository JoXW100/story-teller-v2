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
    editOptions?: Record<string, React.ReactNode>
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

    const handleChange = (newValues: string[]) => {
        onChange(valuesIsList ? newValues : newValues.reduce((prev, value) => (
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

const EditComponent = ({ value, values: selected, params }: ListTemplateComponent<string, SelectionComponentParams>) => {
    const { dropdownClassName, dropdownItemClassName, values, options, defaultValue = null, addLast = true, onChange } = params
    const style = dropdownClassName ? `${styles.dropdown} ${dropdownClassName}` : styles.dropdown;
    const itemStyle = dropdownItemClassName ? `${styles.dropdownItem} ${dropdownItemClassName}` : styles.dropdownItem

    const handleChange = (newValue: string) => {
        onChange(Array.isArray(values) 
            ? addLast ? [ ...values, newValue] : [newValue, ...values]
            : { ...values, [newValue]: defaultValue })
    }

    return (
        <DropdownMenu 
            className={style}
            itemClassName={itemStyle}
            values={options}
            exclude={selected}
            value={value}
            onChange={handleChange}/>
    )
}

const Component = ({ value, index, params }: ListTemplateComponent<string, SelectionComponentParams>): React.ReactNode => {
    const { componentClassName, values, options, editOptions, editType = "none", onChange, defaultValue } = params

    const handleChange = (newValue: string) => {
        let res: string | number = newValue
        if (editType === "number") {
            res = parseInt(res)
            res = isNaN(res) ? 0 : res
        }
        onChange(Array.isArray(values) 
            ? [ ...values.slice(0, index), String(res), ...values.slice(index + 1)] 
            : { ...values, [value]: res })
    }

    return (
        <div className={componentClassName}>
            <b>{options[value]}</b>
            {editType !== "none" && editType !== "enum" &&
                <input 
                    type={editType} 
                    value={values[value]} 
                    onChange={(e) => handleChange(e.target.value)}/>
            }
            {editType === "enum" &&
                <DropdownMenu
                    value={values[value] ?? defaultValue}
                    values={editOptions}
                    onChange={handleChange}/>
            }
        </div>
    )
}

export default SelectionMenu;