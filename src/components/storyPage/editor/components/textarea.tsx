import React, { useContext } from 'react'
import { Context } from 'components/contexts/fileContext';
import TextEditor from 'components/common/textEditor';
import { TextAreaTemplateParams } from 'types/templates';
import styles from 'styles/storyPage/editor.module.scss';

type TextAreaComponentProps = React.PropsWithChildren<{
    params: TextAreaTemplateParams
}>

const TextareaComponent = ({ params }: TextAreaComponentProps): JSX.Element => {
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
            // @ts-ignore
            fill={String(params.fill)}
        >
            <b> {`${params.label ?? "label"}:`} </b>
            <TextEditor text={value} handleInput={handleInput}/>
        </div>
    )
}

export default TextareaComponent;