import React from 'react';
import styles from 'styles/components/textEditor.module.scss';

type TextEditorProps = React.PropsWithRef<{
    text: string
    className?: string
    handleInput: (value: string) => void
    handleContext?: (e: React.MouseEvent<HTMLTextAreaElement, MouseEvent>) => void
}>

const TextEditor = ({ className, text, handleInput, handleContext }: TextEditorProps): JSX.Element => {
    const name = className ? `${className} ${styles.holder}` : styles.holder
    const handleKey = (e : React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.code === 'Tab') {
            e.preventDefault();
            var target: HTMLTextAreaElement = e.target as unknown as HTMLTextAreaElement
            var start = target.selectionStart;
            target.value = `${target.value.substring(0, start)}\t${target.value.substring(start)}`;
            target.selectionStart = target.selectionEnd = start + 1;
            handleInput(target.value);
        }
    }

    return (
        <div className={name}>
            <textarea 
                className={styles.area}
                value={text}
                onChange={(e) => handleInput(e.target.value)}
                onContextMenu={handleContext}
                onKeyDown={handleKey}
                placeholder={"Enter text here"}
                spellCheck
            />
        </div>
    )
}

export default TextEditor;