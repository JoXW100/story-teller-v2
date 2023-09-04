import React, { useContext } from 'react'
import { Context } from 'components/contexts/fileContext';
import SelectionMenu from 'components/common/controls/selectionMenu';
import { getOptionType } from 'data/optionData';
import { TemplateComponentProps } from '.';
import Logger from 'utils/logger';
import { getRelativeMetadata } from 'utils/helpers';
import { SelectionInputTemplateParams } from 'types/templates';
import styles from 'styles/pages/storyPage/editor.module.scss';

const SelectionInputComponent = ({ params }: TemplateComponentProps<SelectionInputTemplateParams>): JSX.Element => {
    const [context, dispatch] = useContext(Context)
    const metadata = getRelativeMetadata(context.file?.metadata, context.editFilePages)
    let values: Record<string, string | number> = metadata?.[params.key] ?? params.default ?? {}
    if (Array.isArray(values)) {
        values = values.reduce((prev, value) => ({ ...prev, [value]: params.default }), {})
    }
    const option = getOptionType(params.enum);
    const editOption = getOptionType(params.editEnum);

    const handleChange = (values: Record<string, string | number>) => {
        dispatch.setMetadata(params.key, values)
    }
    
    if (!option){
        Logger.throw("selectionComponent", new Error("No option type of enum: " + params.enum))
        return null;
    }
    
    if (params.type === "enum" && !editOption){
        Logger.throw("selectionComponent", new Error("No option type of enum: " + params.editEnum))
        return null;
    }
    
    return (
        <div className={styles.editList} data={params.fill && "fill"}>
            <b>{`${ params.label ?? "label"}:`}</b>
            <SelectionMenu
                values={values}
                options={option.options}
                editOptions={editOption?.options}
                defaultValue={params.editDefault}
                componentClassName={styles.editSelectionItem}
                editType={params.type}
                onChange={handleChange}/>
        </div>
    )
}

export default SelectionInputComponent;