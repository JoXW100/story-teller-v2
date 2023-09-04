import { ChangeEventHandler, useEffect, useState } from "react";
import ListTemplateMenu, { ListTemplateComponent } from "./listTemplateMenu";
import DropdownMenu from "./dropdownMenu";
import styles from 'styles/components/listMenu.module.scss';

export type StaticListMenuItemData = { label: string, value: string }

type StaticListMenuProps = React.PropsWithRef<{
    className?: string
    itemClassName?: string
    values: StaticListMenuItemData[]
    options?: Record<string, React.ReactNode>
    type: string
    onChange: (selection: StaticListMenuItemData[]) => void
    validate: (value: string) => boolean
}>

const StaticListMenu = (params: StaticListMenuProps): JSX.Element => {
    const { className, values = [], onChange } = params
    return (
        <ListTemplateMenu<StaticListMenuItemData>
            className={className}
            onChange={onChange}
            Component={StaticComponent}
            params={params}
            values={values}/>
    )
}

const StaticComponent = ({ value, onUpdate, params }: ListTemplateComponent<StaticListMenuItemData, StaticListMenuProps>): JSX.Element => {
    const { className, type, options, validate } = params
    const [state, setState] = useState({ display: "", error: false })
    const style = className ? `${className} ${styles.inputRow}` : styles.inputRow;

    const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
        let input = e.target.value
        if (validate(input)) {
            onUpdate({ label: value.label, value: input })
        } else {
            setState({ display: input, error: true })
        }
    }
    const handleDropdownChange = (val: string) => {
        if (validate(val)) {
            onUpdate({ label: value.label, value: val })
        } else {
            setState({ display: val, error: true })
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
        <div className={style}>
            <b>{value.label}</b>
            { params.type === "enum" 
                ? (
                    <DropdownMenu
                        value={value.value}
                        values={options}
                        onChange={handleDropdownChange}/>
                ) : (
                    <input 
                        className={styles.input}
                        value={state.display}
                        type={type}
                        error={String(state.error)}
                        onChange={handleChange}
                        onBlur={handleLooseFocus}/>
                )
            }
        </div>
    )
}

export default StaticListMenu;