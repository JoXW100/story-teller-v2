import "react";
import { ObjectId } from "types/database";
import { FileStructure } from "types/database/files";
import { IEncounterCardData } from "types/database/files/encounter";

interface DragData { 
    file?: FileStructure, 
    target?: ObjectId 
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
        dragData: DragData,
        encounterData: IEncounterCardData[]
    }
}

window.dragData = window.dragData || {} as DragData
window.encounterData = window.encounterData || [] as IEncounterCardData[]

export type {
    DragData
}