import React, { useContext } from 'react'
import DropdownMenu from 'components/common/controls/dropdownMenu';
import NumberInput from 'components/common/controls/numericInput';
import { Context } from 'components/contexts/fileContext';
import { getOptionType } from 'data/optionData';
import Logger from 'utils/logger';
import { asNumber, getRelativeMetadata } from 'utils/helpers';
import { TemplateComponentProps } from '.';
import { OptionTemplateParams } from 'types/templates';
import { CalculationMode } from 'types/database/editor';
import { IFileMetadata } from 'types/database/files';
import styles from 'styles/pages/storyPage/editor.module.scss';

type OptionData = { type: string | number, value: number }

const getData = (metadata: IFileMetadata, key: string, defaultValue: number): OptionData => {
    let data: OptionData = metadata ? metadata[key] : null
    if (!data || typeof data != typeof {}) {
        data = { type: getOptionType('calc').default, value: defaultValue }
    }
    return data
}

const OptionComponent = ({ params }: TemplateComponentProps<OptionTemplateParams>): JSX.Element => {
    const [context, dispatch] = useContext(Context)
    const metadata = getRelativeMetadata(context.file?.metadata, context.editFilePages)
    const data = getData(metadata, params.key, params.default)
        
    const handleChange = (value: string) => {
        data.type = asNumber(value, null) ?? value
        dispatch.setMetadata(params.key, data);
    }

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            let num = parseInt(e.target.value);
            if (!isNaN(num)) {
                data.value = num;
                dispatch.setMetadata(params.key, data);
            }
        } catch (error) {
            Logger.throw("optionComponent.handleInput", error);
        }
    }

    const handleNumericInput = (value: number) => {
        dispatch.setMetadata(params.key, { ...data, value: value });
    }

    return (
        <div className={styles.editOption}>
            <b>{`${ params.label ?? "label"}:`}</b>
            <DropdownMenu
                className={styles.dropdown}
                itemClassName={styles.dropdownItem}
                values={getOptionType('calc').options} 
                value={data.type as string}
                onChange={handleChange}/>

            { params.type == "number" 
                ? <NumberInput
                    setValue={handleNumericInput}
                    value={data?.value ?? 0}
                    disabled={data.type as CalculationMode == CalculationMode.Auto}/>
                : <input
                    type={params.type}
                    onChange={handleInput}
                    value={data?.value ?? ''}
                    disabled={data.type as CalculationMode == CalculationMode.Auto}/>
            }
        </div>
    )
}
export default OptionComponent;