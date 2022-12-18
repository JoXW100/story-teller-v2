import React from 'react';
import styles from 'styles/components/textEditor.module.scss';

/**
 * 
 * @param {{ 
 *  text: string,
 *  className: string, 
 *  handleInput: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void,
 *  handleContext: (e: React.MouseEvent<HTMLTextAreaElement>) => void
 * }} 
 * @returns {JSX.Element}
 */
const TextEditor = ({ className, text = "Hello World", handleInput, handleContext }) => {
    
    /** @param {React.KeyboardEvent<HTMLTextAreaElement>} e */
    const handleKey = (e) => {
        if (e.code === 'Tab') {
            e.preventDefault();
            var start = e.target.selectionStart;
            e.target.value = `${e.target.value.substring(0, start)}\t${e.target.value.substring(start)}`;
            e.target.selectionStart = e.target.selectionEnd = start + 1;
            handleInput(e);
        }
    }

    return (
        <div className={styles.holder}>
            <textarea 
                className={className ? `${className} ${styles.area}` : styles.area}
                value={text}
                onChange={handleInput}
                onContextMenu={handleContext}
                onKeyDown={handleKey}
                placeholder={"Enter text here"}
                spellCheck
            />
        </div>
    )
}

export default TextEditor;