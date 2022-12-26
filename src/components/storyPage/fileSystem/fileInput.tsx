import React, { useEffect, useRef } from 'react';
import styles from 'styles/storyPage/file.module.scss';

type FileInputProps = React.PropsWithRef<{
    state: any
    setState: any
}>

const FileInput = ({ state, setState }: FileInputProps): JSX.Element => {
    const ref = useRef<HTMLInputElement>()

    const cancelEdit = () => {
        setState({ ...state, selected: false, inEditMode: false })
    }

    const handleEvent = (e: MouseEvent) => {
        if (state.selected && e.target !== ref.current) {
            cancelEdit()
        }
    }

    useEffect(() => {
        if (state.selected) {
            window.addEventListener('click', handleEvent)
            window.addEventListener('contextmenu', handleEvent)
            return () => {
                window.removeEventListener('click', handleEvent)
                window.removeEventListener('contextmenu', handleEvent)
            }
        }
        else ref.current?.select()
    }, [state.inEditMode, state.selected])

    return (
        <input 
            className={styles.input}
            ref={ref}
            value={state.text} 
            onSelect={() => setState({ ...state, selected: true })}
            onChange={(e) => setState({ ...state, text: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && cancelEdit()}
        />
    )
}

export default FileInput;