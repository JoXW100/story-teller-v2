import { ReactNode, useEffect, useMemo, useState } from "react";
import { arraysAreEqual } from "utils/helpers";
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DropdownMenu from "./dropdownMenu";
import styles from 'styles/components/selectionMenu.module.scss';

type SelectionMenuProps = React.PropsWithRef<{
    className: string
    selection: string[]
    values: { [key: string]: ReactNode }
    alternate?: { [key: string]: ReactNode }
    onChange: (selection: string[]) => void
}>

type SelectionRowProps = React.PropsWithChildren<{
    onClick: () => void
}>

const getFirstNotInCollection = (values: any[], collection: any[]) => (
    values.find((key) => !collection.includes(key))
)

/** A menu for selecting multiple items */
const SelectionMenu = ({ className, values, alternate, selection, onChange }: SelectionMenuProps) => {
    const [value, setValue] = useState(
        getFirstNotInCollection(Object.keys(values), selection)
    );

    const handleChange = (value: string) => {
        setValue(value)
    }

    const handleAdd = () => {
        onChange([...selection, value])
    } 

    const handleRemove = (key: string) => {
        onChange(selection.filter((v) => v != key))
    }

    // All items not selected
    const options: { [key: string]: ReactNode } = useMemo(() => (
        Object.keys(values).reduce((prev, val) => 
            selection?.includes(val) 
                ? prev
                : { ...prev, 
                    [val]: alternate && val in alternate 
                        ? alternate[val] 
                        : values[val] 
                }, {}) 
    ), [selection, alternate, values])
    
    // The selected item rows
    const rows = useMemo(() => (
        selection?.map((key) => key in values ? (
            <SelectionRow
                key={key}
                onClick={() => handleRemove(key)}
            > { values[key] } 
            </SelectionRow>
        ) : null )
    ), [selection, values]);

    useEffect(() => {
        setValue(getFirstNotInCollection(Object.keys(values), selection))
    }, [values, selection])
    
    return (
        <div className={className ? `${styles.main} ${className}` : styles.main}>
            <div 
                className={styles.addRow}
                // @ts-ignore
                disabled={Object.values(options).length === 0}
            >
                <DropdownMenu 
                    className={styles.dropdown}
                    values={options}
                    value={value}
                    onChange={handleChange} 
                />
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

const SelectionRow = ({ onClick, children }: SelectionRowProps): JSX.Element => {
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