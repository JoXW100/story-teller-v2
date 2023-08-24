import React, { useEffect, useState } from 'react';

type NumberInputProps = React.PropsWithRef<{
    value: number
    setValue: ((value: number) => void)
    className?: string
    decimal?: boolean
    disabled?: boolean
}>

const NumberInput = ({ value, setValue, className, decimal = false, disabled = false }: NumberInputProps): JSX.Element => {
    const [inputText, setText] = useState("0");
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
            } else if (/[\.,]/g.test(e.target.value)) {
                setText(e.target.value.replace(/[\\.,]/, ''));
            } else {
                setText(e.target.value);
                setValue(parseInt(e.target.value));
            }
        } catch (error) {
            setText(e.target.value);
        }
    }

    useEffect(() => {
        setText(!isNaN(value) ? value.toString() : "0")
    }, [value])

    return (
        <input 
            type="number"
            onChange={handleChange}
            className={className}
            disabled={disabled}
            value={inputText}
            error={String(error)}/>
    );
}

export default NumberInput;