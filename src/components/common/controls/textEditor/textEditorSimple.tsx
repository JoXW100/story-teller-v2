import useTextHandling from 'utils/handlers/textHandler';
import { TextEditorProps } from '.';
import openTextEditorContext from "./contextMenu"
import { Point } from 'types/contextMenu';
import styles from 'styles/components/textEditor.module.scss';

const TextEditorSimple = ({ className, text, onChange }: TextEditorProps): JSX.Element => {
    const name = className ? `${className} ${styles.holder}` : styles.holder
    const [handleChange, handleKey, handleInput] = useTextHandling(onChange)

    const handleContext: React.MouseEventHandler<HTMLTextAreaElement> = (e) => {
        e.preventDefault()
        e.stopPropagation()
        var point: Point = { x: e.clientX, y: e.clientY }
        openTextEditorContext(e.currentTarget, point, onChange)
    }

    return (
        <div className={name}>
            <textarea
                className={styles.area}
                value={text}
                onChange={handleChange}
                onInput={handleInput}
                onContextMenu={handleContext}
                onKeyDown={handleKey}
                placeholder="Enter text here"
                spellCheck/>
        </div>
    )
}

export default TextEditorSimple;