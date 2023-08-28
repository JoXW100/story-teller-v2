import { ChangeEventHandler, useCallback, useEffect, useState } from "react";
import ListTemplateMenu, { ListTemplateComponent } from "./listTemplateMenu";
import styles from 'styles/components/listMenu.module.scss';

export type StaticListMenuItemData = { label: string, value: string }

type StaticListMenuProps = React.PropsWithRef<{
    className?: string
    itemClassName?: string
    values: StaticListMenuItemData[]
    type: string
    onChange: (selection: StaticListMenuItemData[]) => void
    validate: (value: string) => boolean
}>

type StaticComponentParams = {
    className: string
    type: string
    validate: (value: string) => boolean
}

const StaticListMenu = ({ className, itemClassName, values = [], type, onChange, validate }: StaticListMenuProps): JSX.Element => {
    return (
        <ListTemplateMenu<StaticListMenuItemData>
            className={className}
            onChange={onChange}
            Component={StaticComponent}
            params={{ className: itemClassName, type: type, validate: validate }}
            values={values}/>
    )
}

const StaticComponent = ({ value, onUpdate, params }: ListTemplateComponent<StaticListMenuItemData, StaticComponentParams>): JSX.Element => {
    const { className, type, validate } = params
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
            <input 
                className={styles.input}
                value={state.display}
                type={type}
                error={String(state.error)}
                onChange={handleChange}
                onBlur={handleLooseFocus}/>
        </div>
    )
}

export default StaticListMenu;