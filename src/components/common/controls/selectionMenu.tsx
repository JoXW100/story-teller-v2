import { ReactNode, useMemo } from "react";
import DropdownMenu from "./dropdownMenu";
import ListTemplateMenu, { ListTemplateComponent } from "./listTemplateMenu";
import styles from 'styles/components/selectionMenu.module.scss';

type SelectionMenuProps = React.PropsWithRef<{
    className?: string
    dropdownClassName?: string
    dropdownItemClassName?: string
    selection: string[]
    values: Record<string, ReactNode>
    alternate?: Record<string, ReactNode>
    onChange: (selection: string[]) => void
}>

const getFirstNotInCollection = (values: string[], collection: string[]): string => (
    values.find((key) => !collection.includes(key))
)

const SelectionMenu = ({ className, dropdownClassName, dropdownItemClassName, values, alternate, selection, onChange }: SelectionMenuProps) => {
    const style = className ? `${styles.list} ${className}` : styles.list
    const list = Object.keys(values);
    const defaultValue = getFirstNotInCollection(list, selection)

    const options: Record<string, JSX.Element> = useMemo(() => (
        Object.keys(values).reduce((prev, val) => 
            selection?.includes(val) 
                ? prev
                : { ...prev, 
                    [val]: alternate && val in alternate 
                        ? alternate[val] 
                        : values[val] 
                }, {}) 
    ), [selection, alternate, values])

    const handleValidateInput = (value: string): value is string => {
        return value != undefined;
    }

    const EditComponent = ({ value, onUpdate }: ListTemplateComponent<string>) => {
        const style = dropdownClassName ? `${styles.dropdown} ${dropdownClassName}` : styles.dropdown;
        const itemStyle = dropdownItemClassName ? `${styles.dropdownItem} ${dropdownItemClassName}` : styles.dropdownItem
        return (
            <DropdownMenu 
                className={style}
                itemClassName={itemStyle}
                values={options}
                value={value}
                onChange={onUpdate}/>
        )
    }

    const Component = ({ value }: ListTemplateComponent<string>): React.ReactNode => (
        values[value]
    )

    return (
        <ListTemplateMenu<string>
            className={style}
            defaultValue={defaultValue}
            values={selection}
            onChange={onChange}
            validateInput={handleValidateInput}
            Component={Component}
            EditComponent={EditComponent}/>
    )
}

export default SelectionMenu;