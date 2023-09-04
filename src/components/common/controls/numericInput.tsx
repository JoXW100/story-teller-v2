import React, { useEffect, useState } from 'react';

type NumberInputProps = React.PropsWithRef<{
    value: number
    defaultValue?: number
    setValue: (value: number) => void
    onFocusLost?: () => void
    className?: string
    decimal?: boolean
    negative?: boolean
    disabled?: boolean
    autoFocus?: boolean
}>

const NumberInput = ({ value, defaultValue = 0, setValue, onFocusLost, className, decimal = false, negative = false, disabled = false , autoFocus = false}: NumberInputProps): JSX.Element => {
    const [state, setState] = useState({ text: "", error: false })

    const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        let parser = decimal ? parseFloat : parseInt
        let value = parser(e.target.value)
        if (isNaN(value) || (!negative && value < 0)) {
            setState({ text: e.target.value, error: true })
        } else {
            setValue(value)
        }
    }

    const handleBlur = () => {
        onFocusLost && onFocusLost()
        if (state.text !== String(value)) {
            setState({ text: String(defaultValue), error: false })
        }
    }

    useEffect(() => {
        if (String(value) !== state.text) {
            setState({ text: String(value), error: false })
        }
    }, [value])

    return (
        <input 
            type="number"
            onChange={handleChange}
            onBlur={handleBlur}
            className={className}
            disabled={disabled}
            value={state.text}
            error={String(state.error)}
            autoFocus={autoFocus}/>
    );
}

export default NumberInput;