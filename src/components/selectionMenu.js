import { useEffect, useMemo, useState } from "react";
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import styles from 'styles/components/selectionMenu.module.scss';
import DropdownMenu from "./dropdownMenu";

/**
 * @param {[*]} a 
 * @param {[*]} b 
 * @returns {boolean}
 */
const arraysAreEqual = (a, b) => {
    if (a.length !== b.length)
        return false;
    
    for (let index = 0; index < a.length; index++) {
        if (a[index] !== b[index])
            return false;
    }

    return true;
}

/**
 * @param {{ 
 *  className: string,
 *  values: Object.<string, { text: string, element: JSX.Element }>, 
 *  selection: [string], 
 *  defaultValue: string, 
 *  onChange: (selection: [string]) => void
 * }} 
 * @returns {JSX.Element}
 */
const SelectionMenu = ({ className, values = {}, selection = [], onChange }) => {
    const defaultValue = Object.keys(values).find((key) => !selection.includes(key));
    const [state, setState] = useState({
        value: defaultValue,
        selection: selection
    });

    const options = useMemo(() => (
        Object.keys(values).reduce((prev, val) => 
            state.selection?.includes(val) 
                ? prev
                : { ...prev, [val]: values[val].text }, {}) 
    ), [state.selection, values])

    useEffect(() => {
        if (!arraysAreEqual(selection, state.selection)) {
            onChange(state.selection);
        }
    }, [state.selection])

    const handleChange = (value) => {
        setState({ ...state, value: value })
    }

    const handleAdd = () => {
        var selection = [...state.selection, state.value];
        setState({ 
            ...state, 
            value: Object.keys(values).find((key) => !selection.includes(key)), 
            selection: selection  
        })
    } 

    const handleRemove = (key) => {
        var selection = state.selection.filter((x) => x !== key);
        setState({ 
            ...state, 
            value: Object.keys(values).find((key) => !selection.includes(key)), 
            selection: selection  
        })
    }

    const rows = useMemo(() => (
        state.selection?.map((key) => (
            <SelectionRow 
                key={key} 
                onClick={() => handleRemove(key)}
            >
                { values[key].element }
            </SelectionRow>
        ))
    ), [state.selection, values]);
    
    return (
        <div className={className ? `${styles.main} ${className}` : styles.main}>
            <div 
                className={styles.addRow}
                disabled={!(defaultValue && Object.values(options).length > 0)}
            >
                <DropdownMenu 
                    className={styles.dropdown} 
                    values={options}
                    value={state.value}
                    onChange={handleChange}
                />
                <div 
                    className={styles.button}
                    onClick={handleAdd}
                >
                    <AddIcon sx={{ width: '100%' }}/>
                </div>
            </div>
            <div className={styles.content}>
                { rows }
            </div>
        </div>
    )
}

const SelectionRow = ({ onClick, children }) => {
    return (
        <div className={styles.row}>
            <div className={styles.rowContent}>
                { children }
            </div>
            <div 
                className={styles.button}
                onClick={onClick}
            >
                <RemoveIcon sx={{ width: '100%' }}/>
            </div>
        </div>
    )
}

export default SelectionMenu;