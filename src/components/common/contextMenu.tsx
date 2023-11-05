import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import type { Point, ContextRowData, ContextMenuData } from 'types/contextMenu'
import styles from 'styles/common/contextMenu.module.scss'

interface ContextMenuState {
    show: boolean
    interrupt?: boolean
    anchors: { left: number, top: number }
    content: ContextRowData[]
    data: ContextMenuData
}

type ContextMenuEvent = CustomEvent<ContextMenuState>

type ContextMenuItemProps = React.PropsWithRef<{
    data: ContextRowData
}>

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

const ContextMenu = () => {
    const router = useRouter()
    const [state, setState] = useState<ContextMenuState>({
        show: false,
        anchors: { left: 0, top: 9 },
        content: [],
        data: {}
    })
    
    const clickHandler = useCallback(() => {
        state.show && setState((state) => ({ ...state, show: false }))
    }, [state.show])

    const contextHandler = useCallback((ev: ContextMenuEvent) => {
        let detail = ev.detail
        let { depth, height } = getDepthHeight({
            text: null,
            icon: null,
            action: null,
            content: detail.content
        } satisfies ContextRowData)
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
    }, [state.show])

    useEffect(() => {
        setState((state) => ({ ...state, show: false }))
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
    }, [state.show, contextHandler, clickHandler]);

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
            data={(data.enabled ?? true) ? data.content ? "content" : undefined : "hide"}
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
    document.dispatchEvent(new CustomEvent<ContextMenuState>('contextMenu', {
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
export type {
    ContextMenuEvent
}