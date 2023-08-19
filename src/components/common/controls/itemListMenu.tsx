import React, { useCallback, useMemo } from "react";
import useAutoCompleteDialog from "../autoCompleteDialog";
import { IItemMetadata } from "types/database/files";
import ListTemplateMenu, { ListTemplateComponent } from "./listTemplateMenu";
import styles from 'styles/components/listMenu.module.scss';

type ItemListMenuProps<T extends IItemMetadata> = React.PropsWithRef<{
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

const ItemListMenu = <T extends IItemMetadata>({ className, itemClassName, onChange, onClick, validateInput, values = [], templates, prompt = "Edit", defaultValue = "", placeholder, addLast }: ItemListMenuProps<T>): JSX.Element => { 
    const handleValidate = (value: T): value is T => {
        return validateInput(value.id, values)
    }
    
    const EditComponent = ({ value, values, onUpdate }: ListTemplateComponent<T>): JSX.Element => {
        const style = itemClassName ? `${itemClassName} ${styles.input}` : styles.input;
        const [show, hide, onKeyPressed, AutoCompleteDialog] = useAutoCompleteDialog<HTMLInputElement>((e, option: string) => {
            let template = templates[option]
            if (template) {
                onUpdate({ ...value, id: '' })
                onChange(addLast ? [...values, template] : [template, ...values])
            }
        })
    
        const handleInput: React.FormEventHandler<HTMLInputElement> = (e) => {
            const target: HTMLInputElement = e.currentTarget
            let match = dialogShowExpression.exec(target.value);
            if (match) {
                let options = templates ? Object.keys(templates) : []
                options = options?.filter((template) => template.startsWith(match[1])  
                    && !values.some(value => value.id === templates[template].id)) ?? []
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
                    value={value.id}
                    type="text"
                    placeholder={placeholder}
                    data={value.id?.startsWith('$') ? "template" : undefined}
                    onClick={hide}
                    onBlur={hide}
                    onInput={handleInput}
                    onKeyDown={handleKeyDown}
                    onChange={(e) => onUpdate({ ...value, id: e.target.value })}/>
                <AutoCompleteDialog className={styles.dialog}/>
            </div>
        )
    }

    const Component = useCallback(({ value, values, index, onUpdate }: ListTemplateComponent<T>): JSX.Element => {
        const style = itemClassName ? `${itemClassName} ${styles.itemComponent}` : styles.itemComponent;

        const handleInput: React.ChangeEventHandler<HTMLInputElement> = (e) => {
            let input = e.target.value;
            if (validateInput(input, values)) {
                onUpdate({ ...value, id: input })
            }
        }

        return (
            <div className={style}> 
                <input 
                    className={style} 
                    value={value.id}
                    type="text"
                    placeholder={placeholder}
                    onChange={handleInput}/>
                <button onClick={() => onClick(value, index)}>
                    {prompt}
                </button>
            </div>
        )
    }, [itemClassName, placeholder])

    const defaultItem = useMemo<T>(() => ({ id: defaultValue } as T), [defaultValue]);
    
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

export default ItemListMenu;