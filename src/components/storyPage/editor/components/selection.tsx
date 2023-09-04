import { useContext } from 'react'
import { Context } from 'components/contexts/fileContext';
import SelectionMenu from 'components/common/controls/selectionMenu';
import { getOptionType } from 'data/optionData';
import { TemplateComponentProps } from '.';
import Logger from 'utils/logger';
import { getRelativeMetadata } from 'utils/helpers';
import { SelectionTemplateParams } from 'types/templates';
import styles from 'styles/pages/storyPage/editor.module.scss';

const SelectionComponent = ({ params }: TemplateComponentProps<SelectionTemplateParams>): JSX.Element => {
    const [context, dispatch] = useContext(Context)
    const metadata = getRelativeMetadata(context.file?.metadata, context.editFilePages)
    const selection: string[] = metadata?.[params.key] ?? params.default ?? []
    const option = getOptionType(params.enum);
        
    const handleChange = (values: string[] | Record<string, null>) => {
        dispatch.setMetadata(params.key, Array.isArray(values) ? values : Object.keys(values))
    }
    
    if (!option){
        Logger.throw("selectionComponent", new Error("No option type of enum: " + params.enum))
        return null;
    }
    
    return (
        <div className={styles.editList} data={params.fill && "fill"}>
            <b>{`${ params.label ?? "label"}:`}</b>
            <SelectionMenu
                values={selection}
                options={option.options}
                componentClassName={styles.editSelectionItem}
                onChange={handleChange}/>
        </div>
    )
}

export default SelectionComponent;