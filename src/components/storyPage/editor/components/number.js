import React, { useContext, useEffect, useState } from 'react'
import { Context } from 'components/contexts/fileContext';
import styles from 'styles/storyPage/editor.module.scss'
import '@types/data';

/**
 * 
 * @param {{ children: JSX.Element, params: NumberParams }} 
 * @returns {JSX.Element}
 */
const NumberComponent = ({ params }) => {
    const [context, dispatch] = useContext(Context)
    const [state, setState] = useState({
        text: "",
        error: false
    })

    const parse = params.allowFloat ? parseFloat : parseInt;

    useEffect(() => {
        var value = context.file?.metadata 
        ? context.file.metadata[params.key] ?? 0
        : 0;
        setState({ text: value.toString(), error: false })
    }, [context.file?.metadata, params])

    /** @param {React.ChangeEvent<HTMLInputElement>} e */
    const handleInput = (e) => {
        try {
            var number = parse(e.target.value);
            if (!isNaN(number) 
            && (number >= 0 || (number < 0 && params.allowNegative))) {
                dispatch.setMetadata(params.key, number);
                return;
            }
        } catch (error) {
            // Suppress failure to parse
        }
        setState({ text: e.target.value, error: true })
    }

    return (
        <div className={styles.editNumber}>
            <b> {`${ params.label ?? "label"}:`} </b>
            <input 
                type="number" 
                value={state.text} 
                onChange={handleInput}
                error={state.error.toString()}
            />
        </div>
    )
}
export default NumberComponent;