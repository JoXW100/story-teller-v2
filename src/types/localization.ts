interface TextData {
    language: string
    icon: string
    content: { [key: string]: string }
}

interface LocalizationTextData { 
    [key: string]: TextData 
}

export type {
    TextData,
    LocalizationTextData
}