import React, { useContext } from 'react'
import DropdownMenu from 'components/common/dropdownMenu';
import { Context } from 'components/contexts/fileContext';
import { CalculationMode } from 'types/database/editor';
import { OptionTypes } from '../data';
import { TemplateComponentProps } from '.';
import { OptionTemplateParams } from 'types/templates';
import styles from 'styles/storyPage/editor.module.scss';

type OptionData = { type: string | number, value: number }

const OptionComponent = ({ params }: TemplateComponentProps<OptionTemplateParams>): JSX.Element => {
    const [context, dispatch] = useContext(Context)
    const CalcOption = OptionTypes['calc']
    
    const data: OptionData = (context.file?.metadata 
        ? context.file.metadata[params.key]
        : null) ?? { type: CalcOption.default, value: params.default };
    
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
    return (
        <div className={styles.editOption}>
            <b> {`${ params.label ?? "label"}:`} </b>
            <div>
                <DropdownMenu
                    className={styles.dropdown} 
                    values={CalcOption.options} 
                    value={data.type as string}
                    onChange={handleChange}
                />
                <input
                    type={params.type}
                    onChange={handleInput}
                    value={data?.value ?? ''}
                    disabled={data.type as CalculationMode == CalculationMode.Auto}
                />
            </div>
        </div>
    )
}
export default OptionComponent;