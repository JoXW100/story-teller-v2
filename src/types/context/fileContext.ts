import type RequestQueue from "utils/data/requestQueue";
import type { ContextDispatch, ContextState, ContextProvider, DispatchAction } from ".";
import type { DBResponse, ObjectId } from "types/database";
import type { FileGetResult } from "types/database/responses";
import type { IFile } from "types/database/files";

interface EditFilePage {
    template: string
    rootKey: string
    name: string
    index: number
}

interface RendererSidePanelData {
    header: string
    content: React.ReactNode
}

interface FileContextState extends ContextState {
    story: ObjectId
    loading: boolean
    fetching: boolean
    fileSelected: boolean
    viewMode: boolean
    file: IFile
    editFilePages: EditFilePage[]
    rendererSidePanel: RendererSidePanelData
    queue: RequestQueue
}

interface KeyValuePair { key: string, value: any }

type FileContextDispatchAction = 
      DispatchAction<"init", { story: ObjectId, file: ObjectId }, FileContextDispatchAction> 
    | DispatchAction<"initSet", DBResponse<FileGetResult>, FileContextDispatchAction>
    | DispatchAction<"setText", string, FileContextDispatchAction>
    | DispatchAction<"setPublicState", boolean, FileContextDispatchAction>
    | DispatchAction<"setMetadata", KeyValuePair, FileContextDispatchAction>
    | DispatchAction<"removeMetadata", string, FileContextDispatchAction>
    | DispatchAction<"setStorage", KeyValuePair, FileContextDispatchAction>
    | DispatchAction<"setViewMode", boolean, FileContextDispatchAction>
    | DispatchAction<"openTemplatePage", EditFilePage, FileContextDispatchAction>
    | DispatchAction<"closeTemplatePage", number, FileContextDispatchAction>
    | DispatchAction<"setSidePanel", RendererSidePanelData, FileContextDispatchAction>

interface FileContextDispatch extends ContextDispatch {
    setText: (text: string) => void
    setPublic: (value: boolean) => void
    setMetadata: (key: string, value: any) => void
    removeMetadata: (key: string) => void
    setStorage: (key: string, value: any) => void
    openTemplatePage: (page: EditFilePage) => void
    closeTemplatePage: (num?: number) => void
    openSidePanel: (data: RendererSidePanelData) => void
    closeSidePanel: () => void
}


type FileContextProvider = ContextProvider<FileContextState, FileContextDispatch>

export type {
    FileContextProvider,
    FileContextDispatchAction,
    FileContextState,
    FileContextDispatch,
    KeyValuePair,
    EditFilePage
}