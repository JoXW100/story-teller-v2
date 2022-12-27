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
    const [value, setValue] = useState(defaultValue);

    const handleEditChange = (value: ListItem) => {
        setValue(value)
    }

    const handleChange = (value: ListItem, index: number) => {
        values = [...values]
        values[index] = value
        onChange(values)
        
    }

    const handleAdd = () => {
        onChange([value, ...values]);
        setValue(defaultValue)
    } 

    const handleRemove = (index: number) => {
        onChange([ ...values.slice(0, index), ...values.slice(index + 1) ])
    }

    const rows = useMemo(() => (
        values?.map((value, index) => (
            <TemplateListRow 
                key={index} 
                onClick={() => handleRemove(index)}
            > 
                { toComponent(value, (value) => handleChange(value, index)) }
            </TemplateListRow>
        ))
    ), [values]);
    
    return (
        <div className={className ? `${styles.main} ${className}` : styles.main}>
            <div className={styles.addRow}>
                <div className={styles.collection}>
                    { toEditComponent(value, handleEditChange) }
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