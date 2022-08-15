import React, { useContext } from 'react'
import { Context } from 'components/contexts/fileContext';
import styles from 'styles/storyPage/editor.module.scss'
import '@types/editor';

/**
 * 
 * @param {{ children: JSX.Element, params: TextTemplateParams }} 
 * @returns {JSX.Element}
 */
const TextComponent = ({ params }) => {
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
            <b> {`${ params.label ?? "label"}:`} </b>
            <input value={value} onChange={handleInput}/>
        </div>
    )
}
export default TextComponent;