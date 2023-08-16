import React, { useCallback, useEffect, useRef, useState } from 'react';
import styles from 'styles/components/autoCompleteDialog.module.scss';

interface DialogState {
    left: number
    top: number
    options: string[]
    index: number
    params: any[]
}

type AutoCompleteDialogProps = React.PropsWithRef<{
    className?: string
    data?: string
}>

type AutoCompleteDialogValue<T extends HTMLElement> = [
    show: (x: number, y: number, options: string[], ...params: any[]) => void,
    hide: () => void,
    onKeyPressed: (e: React.KeyboardEvent<T>) => boolean,
    dialog: (props: AutoCompleteDialogProps) => JSX.Element
]

const useAutoCompleteDialog = <T extends HTMLElement>(handleApply: (e: React.KeyboardEvent<T>, option: string, ...params: any[]) => void): AutoCompleteDialogValue<T> => {
    const [state, setState] = useState<DialogState>({ 
        left: 0, 
        top: 0, 
        options: [], 
        index: -1,
        params: []
    })

    const dialog = useRef<HTMLDialogElement>()
    const dialogIsOpen = state.options.length > 0;

    const handleHide = () => {
        setState({ left: 0, top: 0, options: [], index: -1, params: [] })
    }

    const handleShow = (x: number, y: number, options: string[], ...params: any[]) => {
        if (options.length > 0) {
            setState({ left: x, top: y, options: options, index: -1, params: params })
        } else {
            handleHide()
        }
    }

    const handleKey = (e: React.KeyboardEvent<T>): boolean => {
        if (!dialogIsOpen) {
            return true;
        }
        switch (e.key) {
            case "ArrowDown":
                setState({ ...state, index: Math.min(state.index + 1, state.options.length - 1)})
                return false
            case "ArrowUp":
                setState({ ...state, index: Math.max(state.index - 1, -1)})
                return false
            case "ArrowRight":
            case "ArrowLeft":
            case "Escape":
            case "Delete":
            case "Tab":
                handleHide();
                return true
            case "Enter":
                if (state.index !== -1 && state.options.length > 0) {
                    handleApply(e, state.options[state.index], ...state.params)
                    handleHide();
                    return false
                }
                return true
            default:
                return true;
        }
    }

    useEffect(() => {
        if (dialog.current && state.index != -1) {
            dialog.current.children[0].children[state.index].scrollIntoView({ block: 'nearest' });
        }
    }, [state.index])
    
    const dialogControl = useCallback(({ className, data }: AutoCompleteDialogProps): JSX.Element => {
        const name = className ? `${className} ${styles.dialog}` : styles.dialog
        return (
            <dialog 
                ref={dialog} 
                className={name}
                open={dialogIsOpen}
                data={data}
                tabIndex={-1}
                autoFocus={false}
                style={{ left: state.left + "px", top: state.top + "px"}}>
                <div className={styles.dialogContentHolder}>
                    { state.options.map((option, index) => (
                        <div 
                            key={option} 
                            className={styles.dialogOption}
                            data={state.index === index ? "selected" : undefined}>
                            {option}
                        </div>
                    ))}
                </div>
            </dialog>
        )
    }, [state])

    return [handleShow, handleHide, handleKey, dialogControl]
}

export default useAutoCompleteDialog;