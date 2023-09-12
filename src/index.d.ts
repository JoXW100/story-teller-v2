import "react";
import { ObjectId } from "types/database";
import { FileStructure } from "types/database/files";
import { IEncounterCard } from "types/database/files/encounter";

interface DragData { 
    file?: FileStructure, 
    target?: ObjectId | string,
    cardIndex?: number
}

declare module 'react' {
    export interface HTMLAttributes<T> {
        tooltips?: string
        disabled?: boolean
        error?: string
        data?: string
        value?: string
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