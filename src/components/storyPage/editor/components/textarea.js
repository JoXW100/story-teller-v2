import React, { useContext } from 'react'
import { Context } from 'components/contexts/fileContext';
import TextEditor from 'components/textEditor/simple-textEditor';
import styles from 'styles/storyPage/editor.module.scss'
import '@types/editor';

/**
 * 
 * @param {{ children: JSX.Element, params: TextareaTemplateParams }} 
 * @returns {JSX.Element}
 */
const TextareaComponent = ({ params }) => {
    const [context, dispatch] = useContext(Context)
    const value = context.file?.content.metadata 
        ? context.file.content.metadata[params.key] ?? ''
        : '';

    /** @param {React.ChangeEvent<HTMLInputElement>} e */
    const handleInput = (e) => {
        dispatch.setMetadata(params.key, e.target.value);
    }

    return (
        <div className={styles.editText}>
            <b> {`${params.label ?? "label"}:`} </b>
            <TextEditor text={value} handleInput={handleInput}/>
        </div>
    )
}

export default TextareaComponent;