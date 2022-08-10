import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import styles from 'styles/components/popupHolder.module.scss'


/**
 * @param {JSX.Element} content
 * @param {?boolean} closable 
 * @param {?boolean} interrupt
 */
export const openPopup = (content, closable = true, interrupt = true) => {
    document.dispatchEvent(new CustomEvent('popup', {
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
    document.dispatchEvent(new CustomEvent('popup', {
        bubbles: true,
        detail: {
            show: false,
            interrupt: true
        }
    }))
}

const PopupHolder = () => {
    const router = useRouter()
    const [state, setState] = useState({
        show: false,
        closeable: true,
        content: []
    })
    
    /** @param {React.MouseEvent<HTMLDivElement, React.MouseEvent>} e */
    const clickHandler = (e) => {
        e.preventDefault()
        e.stopPropagation()
        state.show && state.closeable && e.currentTarget === e.target && 
            setState({ ...state, show: false })
    }

    /** @param {{ detail: PopupEventDetails }} e */
    const popupHandler = (e) => {
        (!state.show || e.detail.interrupt) && setState({
            show: e.detail.show,
            closeable: e.detail.closable,
            content: e.detail.content
        })
    }

    useEffect(() => {
        setState({ ...state, show: false })
    }, [router.route])

    useEffect(() => 
    {
        document.addEventListener("popup", popupHandler)

        return () => {
            document.removeEventListener("popup", popupHandler)
        }
    }, []);

    return state.show && (
        <div 
            id={"popupHolder"}
            className={styles.main}  
            onClick={clickHandler}
        >
            { state.content }
        </div>
    )
}

export default PopupHolder;