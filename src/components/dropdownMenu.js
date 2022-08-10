import { useEffect, useMemo, useState } from 'react'
import styles from 'styles/components/dropdownMenu.module.scss'
import DropDownIcon from '@mui/icons-material/ArrowDropDownSharp';
import DropUpIcon from '@mui/icons-material/ArrowDropUpSharp';

/**
 * 
 * @param {{
 *  className: string,
 *  values: Object.<string, JSX.Element>, 
 *  value: string, 
 *  onChange: (value: string) => void 
*  }}
 */
const DropdownMenu = ({ className, values, value, onChange }) => {

    const [state, setState] = useState({ value: value, open: false });

    const clickHandler = () => {
        state.open && setState((state) => ({ ...state, open: false }))
    }

    useEffect(() => {
        document.addEventListener("click", clickHandler, true);
        return () => document.removeEventListener('click', clickHandler, true)
    }, [])

    useEffect(() => {
        state.value !== value && onChange(state.value)
    }, [state.value])

    const rows = useMemo(() => (
        !state.open 
        ? [state.value] 
        : (
            Object.keys(values)
            .reduce((acc, value) => (
                value === state.value ? [value, ...acc] : [...acc, value]
            ), []))
        ).map((value, index) => (
            <div 
                key={index} 
                className={styles.menuRow} 
                onClick={() => setState({ ...state, value: value })}
            > 
                { values[value] }
            </div>
        )
    ), [values, state.value, state.open])

    return (
        <div 
            className={ className ? styles.main + ' ' + className : styles.main}
            disabled={!values || Object.values(values).length <= 1}
            onClick={() => setState((state) => ({ ...state, open: !state.open}))}
        >
            <div className={styles.content} onMouseLeave={clickHandler}> 
                <div className={styles.menu}> { rows } </div>
            </div>
            <div className={styles.button}>
                { state.open ? <DropUpIcon/> : <DropDownIcon/> }
            </div>
        </div>
    )
}

export default DropdownMenu;