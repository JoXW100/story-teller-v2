import type DiceCollection from "utils/data/diceCollection";
import type Queue from "utils/data/queue";
import type { ContextDispatch, ContextState, ContextProvider, DispatchAction } from ".";
import type { DBResponse, ObjectId } from "types/database";
import type { RollEvent, RollMethod } from "types/dice";
import type { IStoryData } from "types/database/stories";


interface StoryContextState extends ContextState {
    loading: boolean
    editEnabled: boolean
    sidePanelExpanded: boolean
    story: Partial<IStoryData>
    fileId: ObjectId
    rollHistory: Queue<RollEvent>
    helpMenuOpen: boolean
}

interface StoryContextDispatch extends ContextDispatch {
    roll: (collection: DiceCollection, method?: RollMethod, canCritAndFail?: boolean, critRange?: number) => void
    clearRolls: () => void
    collapseSidePanel: () => void
    expandSidePanel: () => void
}

type StoryContextDispatchAction = 
      DispatchAction<"init", undefined, StoryContextDispatchAction> 
    | DispatchAction<"initSet", DBResponse<IStoryData>, StoryContextDispatchAction>
    | DispatchAction<"setFile", ObjectId, StoryContextDispatchAction>
    | DispatchAction<"setEditMode", boolean, StoryContextDispatchAction>
    | DispatchAction<"roll", RollEvent, StoryContextDispatchAction>
    | DispatchAction<"clearRolls", undefined, StoryContextDispatchAction>
    | DispatchAction<"setSidePanelExpanded", boolean, StoryContextDispatchAction>

type StoryContextProvider = ContextProvider<StoryContextState, StoryContextDispatch>

export type {
    StoryContextState,
    StoryContextDispatch,
    StoryContextProvider,
    StoryContextDispatchAction
}