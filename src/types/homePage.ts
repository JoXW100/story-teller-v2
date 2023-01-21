import { Story } from 'types/database/stories';

interface StoryCardData extends Story { type: CardType }

export enum PageStatus {
    Loading = "loading",
    Select = "select",
    Create = "create",
    Connecting = "connecting",
    NoConnection = "noConnection"
}

export enum CardType {
    Create = 'create',
    Story = 'story'
}

export type {
    StoryCardData
}