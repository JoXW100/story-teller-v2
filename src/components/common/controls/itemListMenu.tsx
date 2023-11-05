import useAutoCompleteDialog from "../autoCompleteDialog";
import { ISubPageItemMetadata } from "types/database/files";
import ListTemplateMenu, { ListTemplateComponent } from "./listTemplateMenu";
import styles from 'styles/components/listMenu.module.scss';

type ItemListMenuProps<T extends ISubPageItemMetadata> = React.PropsWithRef<{
    className?: string
    itemClassName?: string
    values: T[]
    templates?: Record<string, T>
    prompt?: string
    defaultValue: T
    placeholder?: string
    addLast?: boolean
    onChange: (selection: T[]) => void
    onClick: (value: T, index: number) => void
    validateInput?: (value: string, values: T[]) => boolean
}>

type ItemListComponent<T> = {
    className?: string
    templates?: Record<string, T>
    placeholder?: string
    prompt?: string
    addLast?: boolean
    onClick: (value: T, index: number) => void
    onChange: (selection: T[]) => void
    validateInput?: (value: string, values: T[]) => boolean
}

const dialogShowExpression = /^\$([a-z0-9]*)$/i

const ItemListMenu = <T extends ISubPageItemMetadata>(params: ItemListMenuProps<T>): JSX.Element => { 
    const { className, itemClassName, onChange, validateInput, values = [], defaultValue, addLast = true } = params
    const handleValidate = (value: T): value is T => {
        return validateInput(value.id, values)
    }
    
    return (
        <ListTemplateMenu<T, ItemListComponent<T>>
            className={className}
            onChange={onChange}
            validateInput={handleValidate}
            Component={Component}
            EditComponent={EditComponent}
            defaultValue={defaultValue}
            values={values}
            addLast={addLast}
            params={{ ...params, className: itemClassName }}/>
    )
}
    
const EditComponent = <T extends ISubPageItemMetadata>({ value, values, onUpdate, params }: ListTemplateComponent<T, ItemListComponent<T>>): JSX.Element => {
    const { className, templates, placeholder, addLast, onChange } = params
    const style = className ? `${className} ${styles.input}` : styles.input;
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

const Component = <T extends ISubPageItemMetadata>({ value, values, index, onUpdate, params }: ListTemplateComponent<T, ItemListComponent<T>>): JSX.Element => {
    const { className, placeholder, prompt, validateInput, onClick } = params
    const style = className ? `${className} ${styles.itemComponent}` : styles.itemComponent;

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
}

export default ItemListMenu;