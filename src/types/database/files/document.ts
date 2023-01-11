import { FileContent, FileMetadata } from "."

interface DocumentContent extends FileContent {
    text: string
}

interface DocumentMetadata extends FileMetadata {
    title?: string
    publish?: boolean
    content?: string
}

export type {
    DocumentContent,
    DocumentMetadata
}