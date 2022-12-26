import React, { useContext } from 'react'
import { Context } from 'components/contexts/fileContext';
import DropdownMenu from 'components/common/dropdownMenu';
import { OptionTypes } from '../data';
import { EnumTemplateParams } from 'types/templates';
import styles from 'styles/storyPage/editor.module.scss'



type EnumComponentProps = React.PropsWithChildren<{
    params: EnumTemplateParams
}>

const EnumComponent = ({ params }: EnumComponentProps): JSX.Element => {
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