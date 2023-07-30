import useTextHandling from 'utils/handlers/textHandler';
import styles from 'styles/components/textEditor.module.scss';

type TextEditorProps = React.PropsWithRef<{
    className?: string
    text: string
    onChange: (value: string) => void
    handleContext?: React.MouseEventHandler<HTMLTextAreaElement>
}>

const TextEditor = ({ className, text, onChange, handleContext }: TextEditorProps): JSX.Element => {
    const name = className ? `${className} ${styles.holder}` : styles.holder
    const [handleChange, handleKey] = useTextHandling(onChange)

    return (
        <div className={name}>
            <textarea
                className={styles.area}
                value={text}
                onChange={handleChange}
                onContextMenu={handleContext}
                onKeyDown={handleKey}
                placeholder="Enter text here"
                spellCheck/>
        </div>
    )
}

export default TextEditor;