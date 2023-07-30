import React, { useContext } from 'react'
import { Context } from 'components/contexts/fileContext';
import TextEditor from 'components/common/textEditor';
import { TemplateComponentProps } from '.';
import { TextAreaTemplateParams } from 'types/templates';
import styles from 'styles/pages/storyPage/editor.module.scss';

const TextareaComponent = ({ params }: TemplateComponentProps<TextAreaTemplateParams>): JSX.Element => {
    const [context, dispatch] = useContext(Context)
    const value: string = context.file?.metadata 
        ? context.file.metadata[params.key] ?? ''
        : '';

    const handleInput = (value: string) => {
        dispatch.setMetadata(params.key, value);
    }

    return (
        <div 
            className={styles.editTextArea}
            data={params.fill ? 'fill' : undefined}>
            <b> {`${params.label ?? "label"}:`} </b>
            <TextEditor text={value} onChange={handleInput}/>
        </div>
    )
}

export default TextareaComponent;