import type DiceCollection from "utils/data/diceCollection";
import type Queue from "utils/data/queue";
import type { ContextDispatch, ContextState, ContextProvider, DispatchAction } from ".";
import type { DBResponse, DateValue, ObjectId } from "types/database";
import type { RollMethod, RollResult } from "types/dice";
import type { IStoryData } from "types/database/stories";
import type { ILocalFile } from "types/database/files";

interface RollEvent {
    result: RollResult
    time: DateValue
}

interface StoryContextState extends ContextState {
    loading: boolean
    editEnabled: boolean
    sidePanelExpanded: boolean
    story: Partial<IStoryData>
    fileId: ObjectId
    rollHistory: Queue<RollEvent>
    helpMenuOpen: boolean,
    localFiles: Record<string, ILocalFile>
    localFilesHasChanged: boolean
}

interface StoryContextDispatch extends ContextDispatch {
    roll: (collection: DiceCollection, method: RollMethod, source: string) => void
    clearRolls: () => void
    collapseSidePanel: () => void
    expandSidePanel: () => void
    setLocalFiles: (files: Record<string, ILocalFile>, localChanged?: boolean) => void
    saveLocalFiles: () => void
}

type StoryContextDispatchAction = 
      DispatchAction<"init", undefined, StoryContextDispatchAction> 
    | DispatchAction<"initSet", DBResponse<IStoryData>, StoryContextDispatchAction>
    | DispatchAction<"setFile", ObjectId, StoryContextDispatchAction>
    | DispatchAction<"setEditMode", boolean, StoryContextDispatchAction>
    | DispatchAction<"roll", RollEvent, StoryContextDispatchAction>
    | DispatchAction<"clearRolls", undefined, StoryContextDispatchAction>
    | DispatchAction<"setSidePanelExpanded", boolean, StoryContextDispatchAction>
    | DispatchAction<"setLocalFiles", { files: Record<string, ILocalFile>, changed: boolean }, StoryContextDispatchAction>
    | DispatchAction<"saveLocalFiles", null, StoryContextDispatchAction>

type StoryContextProvider = ContextProvider<StoryContextState, StoryContextDispatch>

export type {
    StoryContextState,
    StoryContextDispatch,
    RollEvent,
    StoryContextProvider,
    StoryContextDispatchAction
}