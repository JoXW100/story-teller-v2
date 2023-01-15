interface TextData {
    language: string
    icon: string
    content: Record<string, string>
}

interface LocalizationTextData { 
    [key: string]: TextData 
}

export type {
    TextData,
    LocalizationTextData
}