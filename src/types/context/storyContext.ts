import type { ObjectId } from "types/database";
import type { StoryData } from "types/database/stories";
import { RollEvent, RollMethod } from "types/dice";
import DiceCollection from "utils/data/diceCollection";
import type Queue from "utils/data/queue";
import type { ContextDispatch, ContextState, ContextProvider } from ".";

interface StoryContextState extends ContextState {
    loading: boolean
    editEnabled: boolean
    story: StoryData
    fileId: ObjectId
    rollHistory: Queue<RollEvent>
    helpMenuOpen: boolean
}

interface StoryContextDispatch extends ContextDispatch {
    roll: (collection: DiceCollection, method?: RollMethod) => void
    clearRolls: () => void
    openHelpMenu: () => void
    closeHelpMenu: () => void
}

type StoryContextProvider = ContextProvider<StoryContextState, StoryContextDispatch>

export type {
    StoryData,
    StoryContextProvider,
    StoryContextState,
    StoryContextDispatch
}