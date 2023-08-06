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

type StoryContextDispatchAction = 
      DispatchAction<"init", undefined, StoryContextDispatchAction> 
    | DispatchAction<"initSet", DBResponse<StoryData>, StoryContextDispatchAction>
    | DispatchAction<"setFile", ObjectId, StoryContextDispatchAction>
    | DispatchAction<"setEditMode", boolean, StoryContextDispatchAction>
    | DispatchAction<"roll", undefined, StoryContextDispatchAction>
    | DispatchAction<"clearRolls", undefined, StoryContextDispatchAction>
    | DispatchAction<"setSidePanelExpanded", boolean, StoryContextDispatchAction>

type StoryContextProvider = ContextProvider<StoryContextState, StoryContextDispatch>

export type {
    StoryData,
    StoryContextProvider,
    StoryContextState,
    StoryContextDispatch,
    StoryContextDispatchAction
}