
interface IHelpData {
    content: IHelpDataEntry[]
}

interface IHelpDataEntry {
    title: string
    keyWords: string[]
    text: string
}

export type {
    IHelpData,
    IHelpDataEntry
}