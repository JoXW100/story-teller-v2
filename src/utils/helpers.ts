import { Collection, Enum } from "types";
import { EditFilePage } from "types/context/fileContext";
import { ObjectId } from "types/database";
import { IFileMetadata } from "types/database/files";

/** Compares two arrays and returns if they contain equivalent elements */
export const arraysAreEqual = (a: any[], b: any[]): boolean => {
    if (a.length !== b.length)
        return false;
    
    for (let index = 0; index < a.length; index++) {
        if (a[index] !== b[index])
            return false;
    }

    return true;
}

export const arrayUnique = <T>(array: T[]): T[] => {
    let unique = new Set<T>()
    return array.reduce<T[]>((prev, value) => {
        if (unique.has(value)) {
            return prev
        } else {
            unique.add(value)
            return [...prev, value]
        }
    }, [])
}

export function isEnum<T extends Enum>(value: Enum[keyof Enum], type: T): value is T[keyof T] {
    return Object.values(type).includes(value)
}

export function asEnum<T extends Enum>(value: Enum[keyof Enum], type: T): T[keyof T] | undefined {
    return isEnum(value, type) ? value : undefined
}

export function isNumber(value: unknown): value is number {
    return typeof value == 'number'
}

export function asKeyOf<T extends Collection>(value: keyof Collection, type: T): keyof T | undefined {
    return Object.keys(type).includes(value) ? value as keyof Collection : undefined
}

export function asNumber(value: any, nanValue: number = 0): number {
    let temp = Number(value)
    if (isNaN(temp)) temp = nanValue
    return temp
}

export function isObjectId(value: any): value is ObjectId {
    return value && /^[0-9a-fA-F]{24}$/.test(String(value))
}

export function asObjectId(value: any): ObjectId {
    return isObjectId(value) ? value : undefined
}

export function isObjectIdOrNull(value: any): value is ObjectId | null {
    return value === null || value && /^[0-9a-fA-F]{24}$/.test(String(value))
}

export function asArray<T>(value: any): T[] {
    return Array.isArray(value) ? value : []
}

export function getRelativeMetadata(metadata: IFileMetadata, pages: EditFilePage[]): IFileMetadata {
    if (metadata) {
        for (const page of pages) {
            let items: IFileMetadata[] = metadata[page.rootKey]
            if (items) {
                metadata = items[page.index] ?? metadata
            }
        }
    } 
    return metadata
}