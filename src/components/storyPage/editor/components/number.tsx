import React, { useContext, useEffect, useState } from 'react'
import { Context } from 'components/contexts/fileContext';
import { TemplateComponentProps } from '.';
import { getRelativeMetadata } from 'utils/helpers';
import { NumberTemplateParams } from 'types/templates';
import styles from 'styles/pages/storyPage/editor.module.scss'

const NumberComponent = ({ params }: TemplateComponentProps<NumberTemplateParams>): JSX.Element => {
    const [context, dispatch] = useContext(Context)
    const [state, setState] = useState({
        text: "",
        error: false
    })

    const parse = params.allowFloat ? parseFloat : parseInt;

    useEffect(() => {
        const metadata = getRelativeMetadata(context.file?.metadata, context.editFilePages)
        const value: number = (metadata && metadata[params.key]) ?? params.default ?? 0
        setState({ text: value.toString(), error: false })
    }, [context.file?.metadata, context.editFilePages, params])

    const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        try {
            let number = parse(e.target.value);
            if (!isNaN(number)&& (number >= 0 || (number < 0 && params.allowNegative))) {
                dispatch.setMetadata(params.key, number);
                return;
            }
        } catch (error) {
            // Suppress failure to parse
        }
        setState({ text: e.target.value, error: true })
    }

    const handleFocusLost: React.FocusEventHandler<HTMLInputElement> = (e) => {
        if (state.error && state.text == "") {
            let number = parse(String(params.default));
            dispatch.setMetadata(params.key, isNaN(number) ? 0 : number)
        }
    }

    return (
        <div className={styles.editGroupItem}>
            <b> {`${ params.label ?? "label"}:`} </b>
            <input 
                className={styles.editInput}
                type="number" 
                value={state.text} 
                onChange={handleChange}
                onBlur={handleFocusLost}
                error={String(state.error)}/>
        </div>
    )
}
export default NumberComponent;