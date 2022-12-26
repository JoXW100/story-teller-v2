interface DocumentContent {
    text: string
}

interface DocumentMetadata {
    title?: string
    publish?: boolean
    content?: string
}

export type {
    DocumentContent,
    DocumentMetadata
}