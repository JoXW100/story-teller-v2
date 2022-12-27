import React, { useContext } from 'react'
import { Context } from 'components/contexts/fileContext';
import DropdownMenu from 'components/common/dropdownMenu';
import { OptionTypes } from 'data/optionData';
import { TemplateComponentProps } from '.';
import { EnumTemplateParams } from 'types/templates';
import styles from 'styles/storyPage/editor.module.scss'

const EnumComponent = ({ params }: TemplateComponentProps<EnumTemplateParams>): JSX.Element => {
    const [context, dispatch] = useContext(Context)
    const OptionType = OptionTypes[params.type];
    if (!OptionType){
        console.error("No option type of type: " + params.type)
        return null;
    }
    const value: string = context.file?.metadata 
        ? context.file.metadata[params.key] ?? OptionType.default
        : OptionType.default;

    const handleInput = (value: string) => {
        dispatch.setMetadata(params.key, value);
    }

    return (
        <div className={styles.editEnum}>
            <b> {`${ params.label ?? "label"}:`} </b>
            <DropdownMenu 
                className={styles.dropdown} 
                values={OptionType.options} 
                value={value}
                onChange={handleInput}
            />
        </div>
    )
}
export default EnumComponent;