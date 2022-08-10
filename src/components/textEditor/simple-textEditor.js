import styles from 'styles/components/textEditor.module.scss';

/**
 * 
 * @param {{ text: string, handleInput: (e: React.KeyboardEvent<HTMLElement>) => void}} 
 * @returns {JSX.Element}
 */
const TextEditor = ({ text = "Hello World", handleInput }) => {

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
                className={styles.area}
                value={text}
                onChange={handleInput}
                onKeyDown={handleKey}
                placeholder={"Enter text here"}
                spellCheck
            />
        </div>
    )
}

export default TextEditor;