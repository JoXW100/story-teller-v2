import React, { useEffect, useRef } from 'react';
import '@types/fileSystem';

const FileInput = ({ state, setState }) => {
    const ref = useRef()

    const cancelEdit = () => {
        setState({ ...state, selected: false, inEditMode: false })
    }

    /** @param {React.MouseEvent<HTMLDivElement, React.MouseEvent>} e */
    const handleEvent = (e) => {
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
            ref={ref}
            value={state.text} 
            onSelect={() => setState({ ...state, selected: true })}
            onChange={(e) => setState({ ...state, text: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && cancelEdit()}
        />
    )
}

export default FileInput;