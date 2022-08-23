import React, { useEffect, useMemo, useState } from "react";
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import styles from 'styles/components/listMenu.module.scss';

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
 *  values: [string] 
 *  type: string,
 *  defaultValue: string, 
 *  onChange=(selection: [string]) => void
 * }} 
 * @returns {JSX.Element}
 */
const ListMenu = ({ className, values = [], type = "text", defaultValue = "", onChange }) => {
    const [state, setState] = useState({
        value: defaultValue,
        values: values ?? []
    });

    useEffect(() => {
        if (!arraysAreEqual(values, state.values)) {
            onChange(state.values);
        }
    }, [state.values])

    /** @param {React.ChangeEvent<HTMLInputElement>} e */
    const handleChange = (e) => {
        setState({ ...state, value: e.target.value })
    }

    const handleAdd = () => {
        setState({ 
            ...state, 
            value: defaultValue, 
            values: [...state.values, state.value]  
        })
    } 

    const handleRemove = (index) => {
        var values = [ ...state.values.slice(0, index), ...state.values.slice(index + 1) ]
        setState({ 
            ...state, 
            values: values  
        })
    }

    const rows = useMemo(() => (
        state.values?.map((value, index) => (
            <ListRow key={index} onClick={() => handleRemove(index)}>
                { value }
            </ListRow>
        ))
    ), [state.values, values]);
    
    return (
        <div className={className ? `${styles.main} ${className}` : styles.main}>
            <div className={styles.addRow}>
                <input 
                    className={styles.input} 
                    value={state.value}
                    type={type}
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

const ListRow = ({ onClick, children }) => {
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

export default ListMenu;