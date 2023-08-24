import React, { useEffect, useState } from "react";
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import styles from 'styles/components/listMenu.module.scss';

type ListTemplateComponent<T> = React.PropsWithoutRef<{
    value: T
    values: T[]
    index: number
    onUpdate: (value: T) => void
}>

type ListTemplateMenuProps<E, T extends E> = React.PropsWithoutRef<{
    className: string
    onChange: (items: T[]) => void
    validateInput?: (value: E, values: T[]) => value is T
    Component: (props: ListTemplateComponent<T>) => React.ReactNode
    EditComponent?: (props: ListTemplateComponent<E>) => React.ReactNode
    defaultValue?: E
    values: T[]
    addLast?: boolean
}>

const ListTemplateMenu = <E, T extends E = E>({ className, onChange, validateInput, Component, EditComponent, defaultValue, values = [], addLast = true }: ListTemplateMenuProps<E, T>): JSX.Element => {
    const [value, setValue] = useState<E>(defaultValue);

    const handleEditChange = (value: E) => {
        setValue(value)
    }

    const handleChange = (value: T, index: number) => {
        let newValues = [...values]
        newValues[index] = value
        onChange(newValues)
    }

    const handleAdd = () => {
        if (validateInput(value, values)) {
            onChange(addLast ? [...values, value] : [value, ...values]);
            setValue(defaultValue)
        }
    } 

    const handleRemove = (index: number) => {
        onChange([ ...values.slice(0, index), ...values.slice(index + 1) ])
    }

    useEffect(() => {
        setValue(defaultValue)
    }, [defaultValue])
    
    return (
        <div className={className ? `${styles.main} ${className}` : styles.main}>
            { EditComponent &&
                <div className={styles.addRow}>
                    <div className={styles.collection}>
                        <EditComponent value={value} values={values} index={-1} onUpdate={(value) => handleEditChange(value)}/>
                    </div>
                    <button className={styles.button} onClick={handleAdd} disabled={validateInput && !validateInput(value, values ?? [])}>
                        <AddIcon sx={{ width: '100%' }}/>
                    </button>
                </div>
            }
            <div className={styles.content}>
                { values?.map((value, index) => (
                    <TemplateListRow 
                        key={index} 
                        removable={EditComponent !== undefined} 
                        onClick={() => handleRemove(index)}> 
                        <Component value={value} values={values} index={index} onUpdate={(value) => handleChange(value, index)}/>
                    </TemplateListRow>
                ))}
            </div>
        </div>
    )
}

type TemplateListRowProps = React.PropsWithChildren<{
    removable: boolean
    onClick: () => void
}>

const TemplateListRow = ({ children, removable, onClick }: TemplateListRowProps): JSX.Element => {
    return (
        <div className={styles.row}>
            <div className={styles.collection}>
                { children }
            </div>
            { removable &&
                <button className={styles.button} onClick={onClick}>
                    <RemoveIcon sx={{ width: '100%' }}/>
                </button>
            }
        </div>
    )
}

export default ListTemplateMenu;
export type {
    ListTemplateComponent
}