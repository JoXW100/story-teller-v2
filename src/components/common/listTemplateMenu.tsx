import React, { useEffect, useMemo, useState } from "react";
import { arraysAreEqual } from "utils/helpers";
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import styles from 'styles/components/listMenu.module.scss';

type ListItem = any

type ListTemplateMenuProps = React.PropsWithoutRef<{
    className: string
    onChange: (items: ListItem[]) => void
    toComponent: (value: ListItem, onChange: (value: ListItem) => void) => JSX.Element
    toEditComponent: (value: ListItem, onChange: (value: ListItem) => void) => JSX.Element
    defaultValue: ListItem
    values: ListItem[]
}>

const ListTemplateMenu = ({ className, onChange, toComponent, toEditComponent, 
                            defaultValue = {}, values = [] }: ListTemplateMenuProps): JSX.Element => {
    const [state, setState] = useState({
        value: defaultValue,
        values: values ?? []
    });

    useEffect(() => {
        if (!arraysAreEqual(values, state.values)) {
            onChange(state.values);
        }
    }, [state.values])

    const handleEditChange = (value: ListItem) => {
        setState({ ...state, value: value })
    }

    const handleChange = (value: ListItem, index: number) => {
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

    const handleRemove = (index: number) => {
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

type TemplateListRowProps = React.PropsWithChildren<{
    onClick: () => void
}>

const TemplateListRow = ({ children, onClick }: TemplateListRowProps): JSX.Element => {
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