import React, { useContext } from 'react'
import { Context } from 'components/contexts/fileContext';
import DropdownMenu from 'components/common/controls/dropdownMenu';
import { getOptionType } from 'data/optionData';
import { TemplateComponentProps } from '.';
import { EnumTemplateParams } from 'types/templates';
import styles from 'styles/pages/storyPage/editor.module.scss'

const EnumComponent = ({ params }: TemplateComponentProps<EnumTemplateParams>): JSX.Element => {
    const [context, dispatch] = useContext(Context)
    const type = getOptionType(params.type);
    if (!type){
        console.error("No option type of type: " + params.type)
        return null;
    }
    const value: string = context.file?.metadata 
        ? context.file.metadata[params.key] ?? type.default
        : type.default;

    const handleInput = (value: string) => {
        dispatch.setMetadata(params.key, value);
    }

    return (
        <div className={styles.editGroupItem}>
            <b> {`${ params.label ?? "label"}:`} </b>
            <DropdownMenu 
                className={styles.dropdown}
                itemClassName={styles.dropdownItem}
                values={type.options} 
                value={value}
                onChange={handleInput}/>
        </div>
    )
}
export default EnumComponent;