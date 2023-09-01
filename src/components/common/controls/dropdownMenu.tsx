import { ReactNode, useEffect, useState } from 'react'
import DropDownIcon from '@mui/icons-material/ArrowDropDownSharp';
import DropUpIcon from '@mui/icons-material/ArrowDropUpSharp';
import styles from 'styles/components/dropdownMenu.module.scss'

type DropdownMenuProps = React.PropsWithRef<{
    className?: string
    itemClassName?: string,
    values: Record<string, ReactNode>
    exclude?: string[]
    value: string, 
    showButton?: boolean,
    onChange: (value: string) => void
}>

const DropdownMenu = ({ className, itemClassName, values, exclude, value, showButton = true, onChange }: DropdownMenuProps): JSX.Element => {
    const [open, setOpen] = useState(false);
    const disabled = !values || Object.keys(values).filter(x => !exclude?.includes(x)).length <= 1
    const style = className ? `${styles.dropdown} ${className}` : styles.dropdown;
    const itemStyle = itemClassName ? `${styles.dropdownItem} ${itemClassName}` : styles.dropdownItem;
    const { [value]: _, ...rest } = values
    const keys = Object.keys(rest)

    const clickHandler = () => {
        if (open) { setOpen(false) }
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

    return (
        <div 
            className={style}
            disabled={disabled}
            onClick={openHandler}
            data={showButton ? "button" : "nobutton"}>
            <div className={styles.content} onMouseLeave={clickHandler}> 
                <div className={styles.menu} data={open ? "open" : "close"} >
                    { [value, ...keys].map((key, index) => !exclude?.includes(key) && (
                        <button key={index} className={itemStyle} onClick={() => handleClick(key)}>  
                            { values[key] }
                        </button>   
                    ))}
                </div>
            </div>
            <button onClick={openHandler}>
                { open ? <DropUpIcon/> : <DropDownIcon/> }
            </button>
        </div>
    )
}

export default DropdownMenu;