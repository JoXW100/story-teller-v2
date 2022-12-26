
interface HelpData {
    content: HelpDataEntry[]
}

interface HelpDataEntry {
    title: string
    keyWords: string[]
    text: string
}

export type {
    HelpData,
    HelpDataEntry
}