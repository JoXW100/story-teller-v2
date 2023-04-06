import React, { useEffect, useState } from "react";
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import styles from 'styles/components/listMenu.module.scss';

type ListTemplateComponent<T> = React.PropsWithoutRef<{
    value: T
    onUpdate: (value: T) => void
}>

type ListTemplateMenuProps<T> = React.PropsWithoutRef<{
    className: string
    onChange: (items: T[]) => void
    Component: (props: ListTemplateComponent<T>) => JSX.Element
    EditComponent: (props: ListTemplateComponent<T>) => JSX.Element
    defaultValue: T
    values: T[]
}>

function ListTemplateMenu<T>({ className, onChange, Component, EditComponent, defaultValue, values = [] }: ListTemplateMenuProps<T>): JSX.Element {
    const [value, setValue] = useState<T>(defaultValue);

    const handleEditChange = (value: T) => {
        setValue(value)
    }

    const handleChange = (value: T, index: number) => {
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

    useEffect(() => {
        setValue(defaultValue)
    }, [defaultValue])
    
    return (
        <div className={className ? `${styles.main} ${className}` : styles.main}>
            <div className={styles.addRow}>
                <div className={styles.collection}>
                    <EditComponent value={value} onUpdate={(value) => handleEditChange(value)}/>
                </div>
                <button className={styles.button} onClick={handleAdd}>
                    <AddIcon sx={{ width: '100%' }}/>
                </button>
            </div>
            <div className={styles.content}>
                { values?.map((value, index) => (
                    <TemplateListRow key={index} onClick={() => handleRemove(index)}> 
                        <Component value={value} onUpdate={(value) => handleChange(value, index)}/>
                    </TemplateListRow>
                )) }
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
            <button className={styles.button} onClick={onClick}>
                <RemoveIcon sx={{ width: '100%' }}/>
            </button>
        </div>
    )
}

export default ListTemplateMenu;
export type {
    ListTemplateComponent
}