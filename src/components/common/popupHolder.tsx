import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import styles from 'styles/components/popupHolder.module.scss'

interface PopupEvent extends Omit<MouseEvent, 'detail'> { 
    detail: { 
        show?: boolean,
        interrupt?: boolean,
        closable?: boolean,
        content?: JSX.Element
    } 
}

export const openPopup = (content: JSX.Element, closable: boolean = true, interrupt: boolean = true) => {
    document.dispatchEvent(new CustomEvent('popup', {
        bubbles: true,
        detail: {
            show: true,
            interrupt: interrupt,
            closable: closable,
            content: content
        } 
    } as PopupEvent))
}

export const closePopup = () => {
    document.dispatchEvent(new CustomEvent('popup', {
        bubbles: true,
        detail: {
            show: false,
            interrupt: true
        }
    } as PopupEvent))
}

const PopupHolder = (): JSX.Element => {
    const dialog = useRef<HTMLDialogElement>()
    const router = useRouter()
    const [state, setState] = useState({
        closeable: true,
        content: null
    })

    const popupHandler = (e: PopupEvent) => {
        if (!dialog.current.open || e.detail.interrupt) {
            if (e.detail.show) {
                dialog.current?.showModal()
            } else {
                dialog.current?.close()
            }
            setState({
                closeable: e.detail.closable,
                content: e.detail.content
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
        <dialog className={styles.dialog} ref={dialog} children={state.content}/>
    )
}

export default PopupHolder;