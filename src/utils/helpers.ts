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
    return array.reduce((prev, value) => {
        if (unique.has(value)) {
            return prev
        } else {
            unique.add(value)
            return [...prev, value]
        }
    }, [] as T[])
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

export function isObjectId(value: any): value is ObjectId {
    return value && /^[0-9a-fA-F]{24}$/.test(String(value))
}

export function getRelativeMetadata(metadata: IFileMetadata, pages: EditFilePage[]): IFileMetadata {
    if (metadata && pages.length > 0) {
        pages.forEach((page) => {
            let items: IFileMetadata[] = metadata[page.rootKey]
            if (items) {
                metadata = items[page.index] ?? metadata
            }
        })
    } 
    return metadata
}