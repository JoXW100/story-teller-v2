import React, { useContext } from 'react'
import DropdownMenu from 'components/common/dropdownMenu';
import { Context } from 'components/contexts/fileContext';
import { CalculationMode } from 'types/database/editor';
import { OptionTypes } from 'data/optionData';
import { TemplateComponentProps } from '.';
import { OptionTemplateParams } from 'types/templates';
import styles from 'styles/storyPage/editor.module.scss';
import NumberInput from 'components/common/numericInput';
import { FileMetadata } from 'types/database/files';

type OptionData = { type: string | number, value: number }

const getData = (metadata: FileMetadata, key: string, defaultValue: number): OptionData => {
    let data: OptionData = metadata ? metadata[key] : null
    if (!data) {
        data = { type: OptionTypes['calc'].default, value: defaultValue }
    } else if (typeof data != typeof {}) {
        data = { type: OptionTypes['calc'].default, value: defaultValue }
    }
    
    return data
}

const OptionComponent = ({ params }: TemplateComponentProps<OptionTemplateParams>): JSX.Element => {
    const [context, dispatch] = useContext(Context)
    const data = getData(context.file?.metadata, params.key, params.default)
        
    const handleChange = (value: string) => {
        data.type = Number(value) ?? value
        dispatch.setMetadata(params.key, data);
    }

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            var num = parseInt(e.target.value);
            if (!isNaN(num)) {
                data.value = num;
                dispatch.setMetadata(params.key, data);
            }
        } catch (error) {
            console.error(error);
        }
    }

    const handleNumericInput = (value: number) => {
        if (isNaN(value)) {
            data.value = undefined
        } else {
            data.value = value
        }
        dispatch.setMetadata(params.key, data);
    }

    return (
        <div className={styles.editOption}>
            <b> {`${ params.label ?? "label"}:`} </b>
            <div>
                <DropdownMenu
                    className={styles.dropdown} 
                    values={OptionTypes['calc'].options} 
                    value={data.type as string}
                    onChange={handleChange}
                />
                { params.type == "number" 
                    ? <NumberInput
                        setValue={handleNumericInput}
                        value={data?.value ?? 0}
                        disabled={data.type as CalculationMode == CalculationMode.Auto}
                    />
                    : <input
                        type={params.type}
                        onChange={handleInput}
                        value={data?.value ?? ''}
                        disabled={data.type as CalculationMode == CalculationMode.Auto}
                    />

                }
            </div>
        </div>
    )
}
export default OptionComponent;