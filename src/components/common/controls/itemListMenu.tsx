import { useCallback } from "react";
import ListTemplateMenu, { ListTemplateComponent } from "./listTemplateMenu";
import { IFileMetadata } from "types/database/files";
import styles from 'styles/components/listMenu.module.scss';

interface ItemListItem extends IFileMetadata {
    $name: string
}

type ItemListMenuProps<T extends ItemListItem> = React.PropsWithRef<{
    className?: string
    itemClassName?: string
    onChange: (selection: T[]) => void
    onClick: (value: T, index: number) => void
    validateInput?: (value: string, values: T[]) => boolean
    values: T[],
    prompt: string
    defaultValue: string, 
    placeholder?: string
}>

const ItemListMenu = <T extends ItemListItem>({ className, itemClassName, onChange, onClick, validateInput, values = [], prompt = "Edit", defaultValue = "", placeholder }: ItemListMenuProps<T>): JSX.Element => {
    const EditComponent = useCallback(({ value, onUpdate }: ListTemplateComponent<T>): JSX.Element => {
        const style = itemClassName ? `${itemClassName} ${styles.input}` : styles.input;
        return (
            <input 
                className={style} 
                value={value.$name}
                type="text"
                placeholder={placeholder}
                onChange={(e) => onUpdate({ ...value, $name: e.target.value })}/>
        )
    }, [itemClassName, placeholder])

    const Component = useCallback(({ value, index, onUpdate }: ListTemplateComponent<T>): JSX.Element => {
        const style = itemClassName ? `${itemClassName} ${styles.itemComponent}` : styles.itemComponent;
        return (
            <div className={style}> 
                <EditComponent value={value} index={index} onUpdate={onUpdate}/>
                <button onClick={() => onClick(value, index)}>
                    {prompt}
                </button>
            </div>
        )
    }, [EditComponent, itemClassName, prompt, onClick])

    const handleValidate = (value: T): value is T => {
        return validateInput(value.$name, values)
    }
    
    return (
        <ListTemplateMenu<T>
            className={className}
            onChange={onChange}
            validateInput={handleValidate}
            Component={Component}
            EditComponent={EditComponent}
            defaultValue={{ $name: defaultValue } as T}
            values={values}/>
    )
}

export type {
    ItemListItem
}

export default ItemListMenu;