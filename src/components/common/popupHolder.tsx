import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import styles from 'styles/components/popupHolder.module.scss'

interface PopupEventDetails { 
    show?: boolean,
    interrupt?: boolean,
    closable?: boolean,
    content?: JSX.Element
}

export const openPopup = (content: JSX.Element, closable: boolean = true, interrupt: boolean = true) => {
    document.dispatchEvent(new CustomEvent<PopupEventDetails>('popup', {
        bubbles: true,
        detail: {
            show: true,
            interrupt: interrupt,
            closable: closable,
            content: content
        } 
    }))
}

export const closePopup = () => {
    document.dispatchEvent(new CustomEvent<PopupEventDetails>('popup', {
        bubbles: true,
        detail: {
            show: false,
            interrupt: true
        }
    }))
}

const PopupHolder = (): JSX.Element => {
    const dialog = useRef<HTMLDialogElement>()
    const router = useRouter()
    const [state, setState] = useState({
        closeable: true,
        content: null,
        show: false
    })

    const popupHandler = (e: CustomEvent<PopupEventDetails>) => {
        if (!dialog.current.open || e.detail.interrupt) {
            if (e.detail.show) {
                dialog.current?.showModal()
            } else {
                dialog.current?.close()
            }
            setState({
                closeable: e.detail.closable,
                content: e.detail.content,
                show: e.detail.show
            })
        }
    }

    useEffect(() => {
        dialog.current?.close()
    }, [router.route])

    useEffect(() => {
        document.addEventListener("popup", popupHandler)
        return () => { document.removeEventListener("popup", popupHandler) }
    }, []);

    return (
        <dialog ref={dialog} className={styles.dialog} tabIndex={-1} style={state.show ? undefined : { display: "none" }}>
            {state.content}
        </dialog>
    )
}

export default PopupHolder;