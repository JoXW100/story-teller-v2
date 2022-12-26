import "react";
import { ObjectId } from "types/database";
import { FileStructure } from "types/database/files";

interface DragData { 
    file?: FileStructure, 
    target?: ObjectId 
}

declare module 'react' {
    export interface HTMLAttributes<T> {
        tooltips?: string
        disabled?: Boolean
        data?: string
    }
}

declare global {
    export interface Window {
        dragData: DragData
    }
}

window.dragData = window.dragData || {} as DragData

export type {
    DragData
}