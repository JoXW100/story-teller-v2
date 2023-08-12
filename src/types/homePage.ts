import { IStory } from 'types/database/stories';

interface StoryCardData extends IStory { 
    type: CardType
}

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