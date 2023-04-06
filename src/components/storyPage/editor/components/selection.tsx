import React, { ReactNode, useContext, useMemo } from 'react'
import { Context } from 'components/contexts/fileContext';
import SelectionMenu from 'components/common/selectionMenu';
import { OptionType, OptionTypes } from 'data/optionData';
import { TemplateComponentProps } from '.';
import { SelectionTemplateParams } from 'types/templates';
import styles from 'styles/pages/storyPage/editor.module.scss';

type SelectionItemElementProps = React.PropsWithChildren<{
    item: ReactNode
    inputType: string
    value: string | number
    onChange: (value: string) => void
}>

const SelectionComponent = ({ params }: TemplateComponentProps<SelectionTemplateParams>): JSX.Element => {
    const [context, dispatch] = useContext(Context)
    const type: OptionType = OptionTypes[params.enum];

    const selection: Record<string, string | number> = context.file?.metadata 
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
        Object.keys(type?.options ?? {}).reduce((prev, key) => 
            ({ ...prev, [key]: (
                <SelectionItemElement 
                    item={type.options[key]} 
                    value={selection[key]}
                    onChange={(value) => handleInput(value, key)}
                    inputType="number"/>
            )})
        , {})
    ), [selection, context.file.metadata])
    
    // UseMemo above must not be used conditionally
    if (!type){
        console.error("No option type of type: " + params.type)
        return null;
    }
    
    return (
        <div className={styles.editList}>
            <b> {`${ params.label ?? "label"}:`} </b>
            <SelectionMenu
                className={styles.selection}
                values={values}
                selection={Object.keys(selection)}
                alternate={type.options}
                onChange={handleChange}
            />
        </div>
    )
}

const SelectionItemElement = ({ item, value, onChange, inputType }: SelectionItemElementProps): JSX.Element => {
    return (
        <div className={styles.editGroupItem}>
            <b>{item}</b>
            <input 
                type={inputType} 
                value={value ?? ""} 
                onChange={(e) => onChange(e.target.value)}/>
        </div>
    )
}

export default SelectionComponent;