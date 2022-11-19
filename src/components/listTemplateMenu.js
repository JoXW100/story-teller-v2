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
 *  onChange: (items: [*]) => void,
 *  toComponent: (value: *) => JSX.Element,
 *  toEditComponent: (value: *) => JSX.Element,
 *  defaultValue: *,
 *  values: [*]
 * }} 
 * @returns {JSX.Element}
 */
const ListTemplateMenu = ({ className, onChange, toComponent, toEditComponent, defaultValue = {}, values = []}) => {
    const [state, setState] = useState({
        value: defaultValue,
        values: values ?? []
    });

    useEffect(() => {
        if (!arraysAreEqual(values, state.values)) {
            onChange(state.values);
        }
    }, [state.values])

    const handleEditChange = (value) => {
        setState({ ...state, value: value })
    }

    const handleChange = (value, index) => {
        values = [...state.values]
        values[index] = value
        setState({ ...state, values: values })
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
            <TemplateListRow 
                key={index} 
                onClick={() => handleRemove(index)}
            > 
                { toComponent(value, (value) => handleChange(value, index)) }
            </TemplateListRow>
        ))
    ), [state.values, values]);
    
    return (
        <div className={className ? `${styles.main} ${className}` : styles.main}>
            <div className={styles.addRow}>
                <div className={styles.collection}>
                    { toEditComponent(state.value, handleEditChange) }
                </div>
                <div className={styles.button} onClick={handleAdd}>
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
 * @param {{ onClick: () => void }} 
 * @returns {JSX.Element}
 */
const TemplateListRow = ({ children, onClick }) => {
    return (
        <div className={styles.row}>
            <div className={styles.collection}>
                { children }
            </div>
            <div className={styles.button} onClick={onClick}>
                <RemoveIcon sx={{ width: '100%' }}/>
            </div>
        </div>
    )
}

export default ListTemplateMenu;