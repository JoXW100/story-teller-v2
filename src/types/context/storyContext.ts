import type { DBResponse, ObjectId } from "types/database";
import type { StoryData } from "types/database/stories";
import type { RollEvent, RollMethod } from "types/dice";
import type DiceCollection from "utils/data/diceCollection";
import type Queue from "utils/data/queue";
import type { ContextDispatch, ContextState, ContextProvider, DispatchAction } from ".";

interface StoryContextState extends ContextState {
    loading: boolean
    editEnabled: boolean
    sidePanelExpanded: boolean
    story: Partial<StoryData>
    fileId: ObjectId
    rollHistory: Queue<RollEvent>
    helpMenuOpen: boolean
}

interface StoryContextDispatch extends ContextDispatch {
    roll: (collection: DiceCollection, method?: RollMethod) => void
    clearRolls: () => void
    collapseSidePanel: () => void
    expandSidePanel: () => void
}

type StoryContextDispatchAction = DispatchAction<undefined, "init"> 
    | DispatchAction<DBResponse<StoryData>, "initSet">
    | DispatchAction<ObjectId, "setFile">
    | DispatchAction<boolean, "setEditMode">
    | DispatchAction<undefined, "roll">
    | DispatchAction<undefined, "clearRolls">
    | DispatchAction<boolean, "setSidePanelExpanded">

type StoryContextProvider = ContextProvider<StoryContextState, StoryContextDispatch>

export type {
    StoryData,
    StoryContextProvider,
    StoryContextState,
    StoryContextDispatch,
    StoryContextDispatchAction
}