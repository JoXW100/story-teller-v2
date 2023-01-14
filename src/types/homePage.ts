import { Story } from 'types/database/stories';

interface StoryCardData extends Story { type: CardType }

export enum PageStatus {
    Loading = 0,
    Select = 1,
    Create = 2,
    Connecting = 3,
    NoConnection = 4
}

export enum CardType {
    Create = 'create',
    Story = 'story'
}

export type {
    StoryCardData
}