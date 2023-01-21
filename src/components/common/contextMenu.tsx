import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import type { Point, ContextRowData, ContextMenuData, ContextEventDetails } from 'types/contextMenu'
import styles from 'styles/common/contextMenu.module.scss'

interface ContextMenuState {
    show: boolean
    anchors: { left: number, top: number }
    content: ContextRowData[]
    data: ContextMenuData
}

type ContextMenuItemProps = React.PropsWithRef<{
    data: ContextRowData
}>

const ContextMenu = () => {
    const router = useRouter()
    const [state, setState] = useState<ContextMenuState>({
        show: false,
        anchors: { left: 0, top: 9 },
        content: [],
        data: {}
    })
    
    const clickHandler = () => {
        state.show && setState({ ...state, show: false })
    }

    const getDepthHeight = (row: ContextRowData): { height: number, depth: number } => {
        return row.content?.reduce((pre, cur, index) => {
            if ('content' in cur) {
                let { height, depth } = getDepthHeight(cur)
                return {
                    height: Math.max(height + index, pre.height),
                    depth: Math.max(1 + depth, pre.depth)
                }
            }
            return { 
                height: Math.max(1 + index, pre.height),
                depth: pre.depth
            }
        }, { height: 0, depth: 1 }) ?? { height: 0, depth: 0 }
    } 

    const contextHandler = (ev: MouseEvent) => {
        let detail = ev.detail as unknown as ContextEventDetails
        let { depth, height } = getDepthHeight({
            text: null,
            icon: null,
            action: null,
            content: detail.content
        } as ContextRowData)
        let contentWidth = 240 * depth;
        let contentHeight = 26 * height;

        let top = detail.anchors.top + contentHeight - window.innerHeight
        if (top > 0) {
            detail.anchors.top -= top;
        }
        let left = detail.anchors.left + contentWidth - window.innerWidth
        if (left > 0) {
            detail.anchors.left -= left;
        }
        
        if (!state.show || detail.interrupt) {
            setState({
                show: detail.show, 
                anchors: detail.anchors, 
                content: detail.content,
                data: detail.data
            })
        }
    }

    useEffect(() => {
        setState({ ...state, show: false })
    }, [router.route])

    useEffect(() => {
        window.addEventListener("click", clickHandler);
        window.addEventListener("scroll", clickHandler)
        window.addEventListener("contextmenu", clickHandler)
        document.addEventListener("contextMenu", contextHandler)

        return () => {
            window.removeEventListener("click", clickHandler)
            window.removeEventListener("scroll", clickHandler)
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
            { state.content.map((data, index) => 
                <ContextMenuItem key={index} data={data}/>
            )}
        </div>
    ) : null
}

const ContextMenuItem = ({ data }: ContextMenuItemProps): JSX.Element => {
    return (
        <div
            className={styles.item}
            id={data.id}
            onContextMenu={(e) => e.preventDefault()}
            onClick={data.action}
            data={data.content ? "content" : undefined}
        >
            { data.icon && <data.icon/> }
            <div className={styles.text}> { data.text } </div>
            <div className={styles.content}>
                { data.content?.map((data, index) => 
                    <ContextMenuItem key={index} data={data}/>
                )}
            </div>
        </div>
    )
}

export const openContext = (content: ContextRowData[], point: Point, interrupt: boolean = true, data: ContextMenuData = {}) => {
    document.dispatchEvent(new CustomEvent('contextMenu', {
        bubbles: true,
        detail: {
            show: true,
            interrupt: interrupt,
            anchors: { left: point.x, top: point.y },
            content: content,
            data: data
        }
    }))
}

export default ContextMenu;