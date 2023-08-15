import { useCallback, useMemo } from "react";
import useAutoCompleteDialog from "./autoCompleteDialog";
import ListTemplateMenu, { ListTemplateComponent } from "./listTemplateMenu";
import styles from 'styles/components/listMenu.module.scss';

interface ItemListItem {
    $name: string
}

type ItemListMenuProps<T extends ItemListItem> = React.PropsWithRef<{
    className?: string
    itemClassName?: string
    onChange: (selection: T[]) => void
    onClick: (value: T, index: number) => void
    validateInput?: (value: string, values: T[]) => boolean
    values: T[]
    templates?: Record<string, T>
    prompt: string
    defaultValue: string
    placeholder?: string
    addLast?: boolean
}>

const dialogShowExpression = /^\$([a-z0-9]*)$/i

const ItemListMenu = <T extends ItemListItem>({ className, itemClassName, onChange, onClick, validateInput, values = [], templates, prompt = "Edit", defaultValue = "", placeholder, addLast }: ItemListMenuProps<T>): JSX.Element => {
    const EditInputComponent = useCallback(({ value, onUpdate }: ListTemplateComponent<T>): JSX.Element => {
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
    
    const EditComponent = useCallback(({ value, values, onUpdate }: ListTemplateComponent<T>): JSX.Element => {
        const style = itemClassName ? `${itemClassName} ${styles.input}` : styles.input;
        const [show, hide, onKeyPressed, AutoCompleteDialog] = useAutoCompleteDialog<HTMLInputElement>((e, option: string) => {
            let template = templates[option]
            if (template) {
                onUpdate({ ...value, $name: '' })
                onChange(addLast ? [...values, template] : [template, ...values])
            }
        })
    
        const handleInput: React.FormEventHandler<HTMLInputElement> = (e) => {
            const target: HTMLInputElement = e.currentTarget
            let match = dialogShowExpression.exec(target.value);
            if (match) {
                let options = templates ? Object.keys(templates) : []
                options = options?.filter((template) => template.startsWith(match[1])  
                    && !values.some(value => value.$name === templates[template].$name)) ?? []
                show(5, 20, options)
            } else {
                hide();
            }
        }
    
        const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
            if (!onKeyPressed(e)) {
                e.preventDefault()
                e.stopPropagation()
            }
        }
    
        return (
            <div className={styles.inputHolder}>
                <input 
                    className={style} 
                    value={value.$name}
                    type="text"
                    placeholder={placeholder}
                    data={value.$name?.startsWith('$') ? "template" : undefined}
                    onClick={hide}
                    onBlur={hide}
                    onInput={handleInput}
                    onKeyDown={handleKeyDown}
                    onChange={(e) => onUpdate({ ...value, $name: e.target.value })}/>
                <AutoCompleteDialog className={styles.dialog}/>
            </div>
        )
    }, [itemClassName, placeholder, templates])

    const Component = useCallback(({ value, values, index, onUpdate }: ListTemplateComponent<T>): JSX.Element => {
        const style = itemClassName ? `${itemClassName} ${styles.itemComponent}` : styles.itemComponent;
        return (
            <div className={style}> 
                <EditInputComponent value={value} values={values} index={index} onUpdate={onUpdate}/>
                <button onClick={() => onClick(value, index)}>
                    {prompt}
                </button>
            </div>
        )
    }, [EditInputComponent, itemClassName, prompt])

    const handleValidate = (value: T): value is T => {
        return validateInput(value.$name, values)
    }

    const defaultItem = useMemo<T>(() => ({ $name: defaultValue } as T), [defaultValue]);
    
    return (
        <ListTemplateMenu<T>
            className={className}
            onChange={onChange}
            validateInput={handleValidate}
            Component={Component}
            EditComponent={EditComponent}
            defaultValue={defaultItem}
            values={values}
            addLast={addLast}/>
    )
}

export type {
    ItemListItem
}

export default ItemListMenu;