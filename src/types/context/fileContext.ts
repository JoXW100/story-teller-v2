import type RequestQueue from "utils/data/requestQueue";
import type { ContextDispatch, ContextState, ContextProvider, DispatchAction } from ".";
import type { DBResponse, ObjectId } from "types/database";
import type { FileTemplate } from "types/templates";
import type { FileGetResult } from "types/database/responses";
import type { IFile } from "types/database/files";

interface EditFilePage {
    template: keyof FileTemplate['editorSubTemplates']
    rootKey: string
    name: string
    index: number
}

interface FileContextState extends ContextState {
    loading: boolean
    fetching: boolean
    fileSelected: boolean
    viewMode: boolean
    file: IFile
    editFilePages: EditFilePage[]
    story: ObjectId
    queue: RequestQueue
}

interface KeyValuePair { key: string, value: any }

type FileContextDispatchAction = 
      DispatchAction<"init", { story: ObjectId, file: ObjectId }, FileContextDispatchAction> 
    | DispatchAction<"initSet", DBResponse<FileGetResult>, FileContextDispatchAction>
    | DispatchAction<"setText", string, FileContextDispatchAction>
    | DispatchAction<"setMetadata", KeyValuePair, FileContextDispatchAction>
    | DispatchAction<"setStorage", KeyValuePair, FileContextDispatchAction>
    | DispatchAction<"setViewMode", boolean, FileContextDispatchAction>
    | DispatchAction<"openTemplatePage", EditFilePage, FileContextDispatchAction>
    | DispatchAction<"closeTemplatePage", number, FileContextDispatchAction>

interface FileContextDispatch extends ContextDispatch {
    setText: (text: string) => void
    setMetadata: (key: string, value: any) => void
    setStorage: (key: string, value: any) => void
    openTemplatePage: (page: EditFilePage) => void
    closeTemplatePage: (num?: number) => void
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