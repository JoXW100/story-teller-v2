import { ReactNode, useEffect, useMemo, useState } from 'react'
import DropDownIcon from '@mui/icons-material/ArrowDropDownSharp';
import DropUpIcon from '@mui/icons-material/ArrowDropUpSharp';
import styles from 'styles/components/dropdownMenu.module.scss'

type DropdownMenuProps = React.PropsWithRef<{
    className: string
    values: { [key: string]: ReactNode }
    value: string, 
    showButton?: boolean,
    onChange: (value: string) => void
}>

const DropdownMenu = ({ className, values, value, showButton = true, onChange }: DropdownMenuProps): JSX.Element => {
    const [open, setOpen] = useState(false);
    const disabled = !values || Object.values(values).length <= 1

    const clickHandler = () => {
        if (open) {
            setOpen(false)
        }
    }

    const openHandler = () => {
        setOpen(!open)
    }

    const handleClick = (key: string) => {
        if (value !== key && onChange)
            onChange(key)
    }

    useEffect(() => {
        document.addEventListener("click", clickHandler, true);
        return () => document.removeEventListener('click', clickHandler, true)
    }, [])

    useEffect(() => {
        setOpen(false)
    }, [value, values])

    const rows = useMemo(() => {
        if (open) {
            var { [value]: _, ...rest } = values
            return [value, ...Object.keys(rest)].map((value, index) => (
                <DropdownRow key={index} onClick={() => handleClick(value)}>
                    { values[value] }
                </DropdownRow>
            ))
        } else {
            return (
                <DropdownRow>
                    { values[value] }
                </DropdownRow>
            )
        }
    }, [values, value, open])

    return (
        <div 
            className={className ? `${styles.main} ${className}` : styles.main}
            onClick={openHandler}
            disabled={disabled}
        >
            <div className={styles.content} onMouseLeave={clickHandler}> 
                <div 
                    className={styles.menu}
                    data={open ? "true" : "false"}
                > { rows } </div>
            </div>
            { showButton &&
                <div className={styles.button}>
                    { open ? <DropUpIcon/> : <DropDownIcon/> }
                </div>
            }
        </div>
    )
}

type DropdownRowProps = React.PropsWithChildren<{
    onClick?: () => void
}>

const DropdownRow = ({ children, onClick }: DropdownRowProps): JSX.Element => {
    return (
        <div className={styles.menuRow} onClick={onClick}> 
            { children }
        </div>
    )
}

export default DropdownMenu;