import { ChangeEventHandler, useCallback, useEffect, useState } from "react";
import ListTemplateMenu, { ListTemplateComponent } from "./listTemplateMenu";
import styles from 'styles/components/listMenu.module.scss';

export type StaticListMenuItemData = { label: string, value: string }

type StaticListMenuProps = React.PropsWithRef<{
    className?: string
    itemClassName?: string
    type: string
    values: StaticListMenuItemData[]
    onChange: (selection: StaticListMenuItemData[]) => void
    validate: (value: string) => boolean
}>

type StaticComponentProps = React.PropsWithoutRef<{
    value: StaticListMenuItemData
    className: string
    type: string
    onUpdate: (value: StaticListMenuItemData) => void
    validate: (value: string) => boolean
}>

const StaticListMenu = ({ className, itemClassName, type, onChange, validate, values = [] }: StaticListMenuProps): JSX.Element => {
    const Component = useCallback(({ value, onUpdate }: ListTemplateComponent<StaticListMenuItemData>): JSX.Element => (
        <StaticComponent 
            value={value} 
            type={type} 
            className={itemClassName} 
            onUpdate={onUpdate}
            validate={validate}/>
    ), [type, itemClassName, validate])

    return (
        <ListTemplateMenu<StaticListMenuItemData>
            className={className}
            onChange={onChange}
            Component={Component}
            values={values}/>
    )
}

const StaticComponent = ({ value, className, type, onUpdate, validate }: StaticComponentProps): JSX.Element => {
    const [state, setState] = useState({ display: "", error: false })
    const style = className ? `${className} ${styles.input}` : styles.input;

    const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
        let input = e.target.value
        if (validate(input)) {
            onUpdate({ label: value.label, value: input })
        } else {
            setState({ display: input, error: true })
        }
    }
    const handleLooseFocus = () => {
        if (state.error) {
            setState({ display: value.value, error: false })
        }
    }

    useEffect(() => {
        setState({ display: value.value, error: false })
    }, [value])

    return (
        <div className={styles.inputRow}>
            <label>{value.label}</label>
            <input 
                className={style}
                value={state.display}
                type={type}
                error={String(state.error)}
                onChange={handleChange}
                onBlur={handleLooseFocus}/>
        </div>
    )
}

export default StaticListMenu;