import React, { useContext, useEffect, useState } from 'react'
import { Context } from 'components/contexts/fileContext';
import { TemplateComponentProps } from '.';
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
        var value = context.file?.metadata 
        ? context.file.metadata[params.key] ?? 0
        : 0;
        setState({ text: value.toString(), error: false })
    }, [context.file?.metadata, params])

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            var number = parse(e.target.value);
            if (!isNaN(number)&& (number >= 0 || (number < 0 && params.allowNegative))) {
                dispatch.setMetadata(params.key, number);
                return;
            }
        } catch (error) {
            // Suppress failure to parse
        }
        setState({ text: e.target.value, error: true })
    }

    return (
        <div className={styles.editGroupItem}>
            <b> {`${ params.label ?? "label"}:`} </b>
            <input 
                type="number" 
                value={state.text} 
                onChange={handleInput}
                data={state.error ? "error" : undefined}
            />
        </div>
    )
}
export default NumberComponent;