import React from "react"

type ContextMenuData = Record<string, any>

interface Point {
    x: number
    y: number
}

interface ContextRowData {
    text: string
    icon: any
    id?: string
    action?: React.MouseEventHandler
    content?: ContextRowData[]
}

interface ContextEventDetails extends Event {
    show: boolean
    interrupt: boolean
    anchors: { left: number, top: number }
    content?: ContextRowData[]
    data?: ContextMenuData
}


export type {
    Point,
    ContextRowData,
    ContextEventDetails,
    ContextMenuData
}