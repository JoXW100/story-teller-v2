import React, { useState } from 'react';

type NumberInputProps = React.PropsWithRef<{
    value: number
    setValue: ((value: number) => void)
    className?: string
    decimal?: boolean
    disabled?: boolean
}>

const NumberInput = ({ value, setValue, className, decimal, disabled }: NumberInputProps): JSX.Element => {
    const [inputText, setText] = useState(!isNaN(value) ? value.toString() : "");
    const error = isNaN(parseFloat(inputText))
    const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        try {
            if (decimal) {
                let sides = e.target.value.replace(',','.').split('.');
                let num1 = parseFloat(sides[0]);
                let num2 = parseFloat(sides[1]);
                let text1 = isNaN(num1) ? 
                            (sides[1] === undefined ? ""
                            : "0")
                            : `${num1}`;
                let text2 = sides[1] === undefined ? ""
                            : isNaN(num2) ? "."
                            : `.${num2}`
                setText(text1 + text2);
                setValue(parseFloat(e.target.value));
            } else {
                setText(e.target.value);
                setValue(/[.,]/.test(e.target.value)
                    ? NaN
                    : parseInt(e.target.value));
            }
        } catch (error) {
            setText(e.target.value);
        }
    }

    return (
        <input 
            type="number"
            onChange={handleChange}
            className={className}
            disabled={disabled}
            value={inputText}
            data={error ? "error" : undefined}
        />
    );
}

export default NumberInput;