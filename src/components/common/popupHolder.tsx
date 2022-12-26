import React, { useState, useEffect } from 'react'
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
    const router = useRouter()
    const [state, setState] = useState({
        show: false,
        closeable: true,
        content: null
    })
    
    const clickHandler = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.preventDefault()
        e.stopPropagation()
        if (state.show && state.closeable && e.currentTarget === e.target) {
            setState({ ...state, show: false })
        }
    }

    const popupHandler = (e: PopupEvent) => {
        if (!state.show || e.detail.interrupt) {
            setState({
                show: e.detail.show,
                closeable: e.detail.closable,
                content: e.detail.content
            })
        }
    }

    useEffect(() => {
        setState({ ...state, show: false })
    }, [router.route])

    useEffect(() => {
        document.addEventListener("popup", popupHandler)
        return () => { document.removeEventListener("popup", popupHandler) }
    }, []);

    return state.show && (
        <div 
            id={"popupHolder"}
            className={styles.main}  
            onClick={clickHandler}
        > { state.content } </div>
    )
}

export default PopupHolder;