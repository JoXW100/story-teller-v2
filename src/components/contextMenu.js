import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import styles from 'styles/components/contextMenu.module.scss'

/**
 * @typedef ContextRowData
 * @property {string} text
 * @property {JSX.Element} icon
 * @property {() => void} action
 */

/**
 * @typedef ContextEventDetails
 * @property {boolean} show 
 * @property {boolean} interrupt 
 * @property {{ left: number, top: number }} anchors 
 * @property {[ContextRowData]} content 
 */

/**
 * @param {[ContextRowData]} content 
 * @param {{ x: number, y: number }} anchors
 * @param {?boolean} interrupt
 */
export const openContext = (content, anchors, interrupt = true) => {
    document.dispatchEvent(new CustomEvent('contextMenu', {
        bubbles: true,
        detail: {
            show: true,
            interrupt: interrupt,
            anchors: { left: anchors.x, top: anchors.y },
            content: content
        }
    }))
}

const ContextMenu = () => {
    const router = useRouter()
    const [state, setState] = useState({
        show: false,
        anchors: { left: 0, top: 9 },
        content: []
    })
    
    const clickHandler = () => {
        state.show && setState({ ...state, show: false })
    }

    /**
     * @param {{ detail: ContextEventDetails }} e 
     */
    const contextHandler = (e) => {
        let contentHeight = e.detail.content.length * 26;
        let contentWidth = 150;

        if (e.detail.anchors.top + contentHeight > window.innerHeight) {
            e.detail.anchors.top -= contentHeight;
        }
        if (e.detail.anchors.left + contentWidth > window.innerWidth) {
            e.detail.anchors.left -= contentWidth;
        }
        (!state.show || e.detail.interrupt) && setState({
            show: e.detail.show, 
            anchors: e.detail.anchors, 
            content: e.detail.content
        })
    }

    useEffect(() => {
        setState({ ...state, show: false })
    }, [router.route])

    useEffect(() => 
    {
        window.addEventListener("click", clickHandler);
        window.addEventListener("contextmenu", clickHandler)
        document.addEventListener("contextMenu", contextHandler)

        return () => {
            window.removeEventListener("click", clickHandler)
            window.removeEventListener("contextmenu", clickHandler)
            document.removeEventListener("contextMenu", contextHandler)
        }
    }, [state.show]);

    return state.show ? (
        <div 
            id={'contextMenu'}
            className={styles.main} 
            style={state.anchors}
        >
            { state.content.map((row, index) => (
                <div
                    key={index}
                    onContextMenu={(e) => e.preventDefault()} 
                    onClick={row.action}
                >
                    { row.icon && <row.icon/> }
                    <div> { row.text } </div>
                </div>
            ))}
        </div>
    ) : null
}

export default ContextMenu;