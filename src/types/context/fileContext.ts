import type { FileContent, FileData, FileGetResult, FileMetadata, FileStorage } from "types/database/files";
import type RequestQueue from "utils/data/requestQueue";
import type { ContextDispatch, ContextState, ContextProvider, DispatchAction } from ".";
import type { DBResponse, ObjectId } from "types/database";
import { Variables } from "types/elements";

interface FileContextState extends ContextState {
    loading: boolean
    fetching: boolean
    fileSelected: boolean
    viewMode: boolean
    file: FileData<FileContent, FileMetadata, FileStorage>
    variables: Variables
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
    | DispatchAction<"setVariables", Variables, FileContextDispatchAction>

interface FileContextDispatch extends ContextDispatch {
    setText: (text: string) => void
    setMetadata: (key: string, value: any) => void
    setStorage: (key: string, value: any) => void
    setVariables: (variables: Variables) => void
}


type FileContextProvider = ContextProvider<FileContextState, FileContextDispatch>

export type {
    FileContextProvider,
    FileContextDispatchAction,
    FileContextState,
    FileContextDispatch,
    KeyValuePair
}