import React, { useContext } from 'react'
import { Context } from 'components/contexts/fileContext';
import { CalculationMode } from '@enums/editor';
import DropdownMenu from 'components/dropdownMenu';
import styles from 'styles/storyPage/editor.module.scss'
import '@types/data';

/**
 * 
 * @param {{ children: JSX.Element, params: OptionParams<any> }} 
 * @returns {JSX.Element}
 */
const OptionComponent = ({ params }) => {
    const [context, dispatch] = useContext(Context)

    /** @type {{ type: string, value: any }} */
    const data = (context.file?.metadata 
        ? context.file.metadata[params.key]
        : null) ?? { type: CalculationMode.Auto, value: params.default };

    const values = Object.keys(CalculationMode)
        .reduce((prev, key) => ({ ...prev, [CalculationMode[key]]: key }), {});

    /** @param {string} value */
    const handleChange = (value) => {
        data.type = parseInt(value);
        dispatch.setMetadata(params.key, data);
    }

    /** @param {React.ChangeEvent<HTMLInputElement>} e */
    const handleInput = (e) => {
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
                    values={values} 
                    value={data.type}
                    onChange={handleChange}
                />
                <input
                    type={params.type}
                    onChange={handleInput}
                    value={String(data?.value ?? "")}
                    disabled={data.type == CalculationMode.Auto}
                />
            </div>
        </div>
    )
}
export default OptionComponent;