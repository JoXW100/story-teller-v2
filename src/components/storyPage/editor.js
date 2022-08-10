import { useContext, useEffect, useMemo } from 'react'
import { Context } from 'components/contexts/fileContext';
import TextEditor from 'components/textEditor/simple-textEditor';
import styles from 'styles/storyPage/editor.module.scss'

const Editor = () => {
    const [context, dispatch] = useContext(Context)

    /** @param {React.KeyboardEvent<HTMLElement>} e */
    const handleInput = (e) => {
        dispatch.setText(e.target.value);
    }

    // Prevent leaving page with unsaved changes
    useEffect(() => {
        if (window) {
            window.onbeforeunload = (e) => {
                if (context.queue.requestIsQueued) {
                    e.preventDefault();
                    e.returnValue = "";
                }
            };
        }
        
        return () => {
            if (window) {
                window.onbeforeunload = null;
            }
        }
    }, [])

    const content = useMemo(() => {
        return context.file
            ? <TextEditor text={context.file?.content.text} handleInput={handleInput}/>
            : (
                <div className={styles.empty}>
                    Select File to Edit
                </div>
            )
    }, [context.file])

    return (
        <div className={styles.main}>
           { content }
        </div>
    )
}



export default Editor;