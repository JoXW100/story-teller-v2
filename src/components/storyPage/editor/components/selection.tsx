import React, { ReactNode, useContext, useMemo } from 'react'
import { Context } from 'components/contexts/fileContext';
import SelectionMenu from 'components/common/selectionMenu';
import { OptionTypes } from '../data';
import { SelectionTemplateParams } from 'types/templates';
import styles from 'styles/storyPage/editor.module.scss';

type SelectionComponentProps = React.PropsWithChildren<{
    params: SelectionTemplateParams
}>

type SelectionItemElementProps = React.PropsWithChildren<{
    item: ReactNode
    inputType: string
    value: string | number
    onChange: (value: string) => void
}>

const SelectionComponent = ({ params }: SelectionComponentProps): JSX.Element => {
    const [context, dispatch] = useContext(Context)
    const optionType = OptionTypes[params.enum];

    const selection: { [s: string]: any; } = context.file?.metadata 
        ? context.file.metadata[params.key] ?? {}
        : {};
        
    const handleChange = (selected: string[]) => {
        const data = {};
        selected.forEach((key) => (data[key] = selection[key] ?? params.default))
        dispatch.setMetadata(params.key, data)
    }

    const handleInput = (value: any, key: string) => {
        selection[key] = value;
        dispatch.setMetadata(params.key, selection)
    }

    const values = useMemo<{[key: string]: ReactNode }>(() => (
        Object.keys(optionType?.options ?? {}).reduce((prev, key) => 
            ({ ...prev, [key]: (
                <SelectionItemElement 
                    item={optionType.options[key]} 
                    value={selection[key]}
                    onChange={(value) => handleInput(value, key)}
                    inputType="number"
                />
            )})
        , {})
    ), [selection, context.file.metadata])
    
    // UseMemo above must not be used conditionally
    if (!optionType){
        console.error("No option type of type: " + params.type)
        return null;
    }
    
    return (
        <div className={styles.editSelection}>
            <b> {`${ params.label ?? "label"}:`} </b>
            <SelectionMenu
                className={styles.selection}
                values={values}
                selection={Object.keys(selection)}
                alternate={optionType.options}
                onChange={handleChange}
            />
        </div>
    )
}

const SelectionItemElement = ({ item, value, onChange, inputType }: SelectionItemElementProps): JSX.Element => {
    return (
        <div className={styles.editSelectionItem}>
            <b>{item}</b>
            <input 
                type={inputType} 
                value={value ?? ""} 
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    )
}

export default SelectionComponent;