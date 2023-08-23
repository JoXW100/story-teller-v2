import { UsedFileTypes } from "./database/files"

interface Palette {
    name: string
    colors: {
        "background": string
        "accents": string

        "good": string
        "bad": string
        "neutral": string
        "warning": string
        "error": string

        "syntax-function-name": string
        "syntax-function-option": string
        "syntax-function-separator": string
        "syntax-calc-value": string
        "syntax-calc-number": string
        "syntax-bracket": string
        "syntax-variable": string
        "syntax-tab": string

        "document-background": string
        "document-text": string
        "document-border": string

        "input-background": string
        "input-text": string
        "input-border": string
        "input-icons": string

        "interactive-background": string
        "interactive-text": string
        "interactive-border": string
        "interactive-icons": string

        "main-background": string
        "main-decoration": string
        "main-text": string
        "main-border": string
        "main-shadow": string
        "main-icons": string

        "second-background": string
        "second-decoration": string
        "second-text": string
        "second-border": string
        "second-shadow": string
        "second-icons": string
    } & Record<UsedFileTypes, string>
}

export type {
    Palette
}