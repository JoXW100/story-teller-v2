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
 *  onChange=(selection: [string]) => void
 *  values: [string] 
 *  type: string,
 *  defaultValue: string, 
 *  editEnabled: boolean
 * }} 
 * @returns {JSX.Element}
 */
const ListMenu = ({ className, onChange, values = [], type = "text", defaultValue = "", editEnabled = false }) => {
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
    const handleChange = (e, index = -1) => {
        console.log(e, index)
        if (index < 0)
            setState({ ...state, value: e.target.value })
        else {
            values = [...state.values]
            values[index] = e.target.value
            setState({ ...state, values: values })
        }
    }

    const handleAdd = () => {
        setState({ 
            ...state, 
            value: defaultValue, 
            values: [state.value, ...state.values]  
        })
    } 

    const handleRemove = (index) => {
        var values = [ ...state.values.slice(0, index), ...state.values.slice(index + 1) ]
        setState({ ...state, values: values })
    }

    const rows = useMemo(() => (
        state.values?.map((value, index) => (
            <ListRow 
                key={index} 
                value={value} 
                onClick={() => handleRemove(index)}
                onChange={(e) => handleChange(e, index)}
                editEnabled={editEnabled}
            />
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

/**
 * 
 * @param {{ 
 *  value: string,
 *  onClick: () => void,
 *  onChange: (e) => void
 *  type: string,
 *  editEnabled: boolean
 * }} 
 * @returns {JSX.Element}
 */
const ListRow = ({ value, onClick, onChange, type, editEnabled }) => {
    return (
        <div className={styles.row}>
            { editEnabled ? (
                <input 
                    className={styles.input} 
                    value={value}
                    type={type}
                    onChange={onChange}
                />
            ) : (
                <div className={styles.rowContent}>
                    { value }
                </div>
            )}
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