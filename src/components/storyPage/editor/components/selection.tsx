import React, { ReactNode, useContext, useMemo } from 'react'
import { Context } from 'components/contexts/fileContext';
import SelectionMenu from 'components/common/controls/selectionMenu';
import { getOptionType } from 'data/optionData';
import { TemplateComponentProps } from '.';
import Logger from 'utils/logger';
import { getRelativeMetadata } from 'utils/helpers';
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
    const metadata = getRelativeMetadata(context.file?.metadata, context.editFilePages)
    const selection: Record<string, string | number> = metadata ? metadata[params.key] ?? {} : {};
    const option = getOptionType(params.enum);
        
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
        Object.keys(option?.options ?? {}).reduce((prev, key) => 
            ({ ...prev, [key]: (
                <SelectionItemElement 
                    item={option.options[key]} 
                    value={selection[key]}
                    onChange={(value) => handleInput(value, key)}
                    inputType={params.type}/>
            )})
        , {})
    ), [params.enum, params.type, selection, context.file?.metadata, context.editFilePages])
    
    // UseMemo above must not be used conditionally
    if (!option){
        Logger.throw("selectionComponent", new Error("No option type of enum: " + params.enum))
        return null;
    }
    
    return (
        <div className={styles.editList}>
            <b> {`${ params.label ?? "label"}:`} </b>
            <SelectionMenu
                className={styles.editSelectionMenu}
                values={values}
                selection={Object.keys(selection)}
                alternate={option.options}
                onChange={handleChange}/>
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