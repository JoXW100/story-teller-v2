import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import styles from 'styles/components/contextMenu.module.scss'

/**
 * @typedef ContextRowData
 * @property {string} text
 * @property {JSX.Element} icon
 * @property {() => void} action
 * @property {[ContextRowData]} content
 */

/**
 * @typedef ContextEventDetails
 * @property {boolean} show 
 * @property {boolean} interrupt 
 * @property {{ left: number, top: number }} anchors 
 * @property {[ContextRowData]} content 
 * @property {Object.<string, any>} data
 */

/**
 * @param {[ContextRowData]} content 
 * @param {{ x: number, y: number }} anchors
 * @param {?boolean} interrupt
 */
export const openContext = (content, anchors, interrupt = true, data = {}) => {
    document.dispatchEvent(new CustomEvent('contextMenu', {
        bubbles: true,
        detail: {
            show: true,
            interrupt: interrupt,
            anchors: { left: anchors.x, top: anchors.y },
            content: content,
            data: data
        }
    }))
}

const ContextMenu = () => {
    const router = useRouter()
    const [state, setState] = useState({
        show: false,
        anchors: { left: 0, top: 9 },
        content: [],
        data: {}
    })
    
    const clickHandler = () => {
        state.show && setState({ ...state, show: false })
    }

    /**
     * @param {{ detail: ContextEventDetails }} e 
     */
    const contextHandler = (e) => {
        console.log(e.detail.content)
        let contentHeight = e.detail.content.length * 26;
        let contentWidth = 240;
        e.detail.content.forEach((data, index) => {
            if ('content' in data) {
                contentHeight = Math.max(contentHeight, (index + data.content.length) * 26)
                contentWidth = 240 * 2
            }
        })
        if (e.detail.anchors.top + contentHeight > window.innerHeight) {
            e.detail.anchors.top -= contentHeight;
        }
        if (e.detail.anchors.left + contentWidth > window.innerWidth) {
            e.detail.anchors.left -= contentWidth;
        }
        (!state.show || e.detail.interrupt) && setState({
            show: e.detail.show, 
            anchors: e.detail.anchors, 
            content: e.detail.content,
            data: e.detail.data
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
            { state.content.map((data, index) => <ContextMenuItem key={index} data={data}/>)}
        </div>
    ) : null
}

/**
 * 
 * @param {{ identifier: any, data: ContextRowData }} 
 * @returns {JSX.Element}
 */
const ContextMenuItem = ({ data }) => {
    return (
        <div
            className={styles.item}
            onContextMenu={(e) => e.preventDefault()}
            content={data.content ? "true": undefined}
            onClick={data.action}
        >
            { data.icon && <data.icon/> }
            <div className={styles.text}> { data.text } </div>
            <div className={styles.content}>
                { data.content?.map((data, index) => <ContextMenuItem key={index} data={data}/>) }
            </div>
        </div>
    )
}

export default ContextMenu;