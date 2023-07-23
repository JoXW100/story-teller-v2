import type { FileContent, FileData, FileGetResult, FileMetadata, FileStorage } from "types/database/files";
import type RequestQueue from "utils/data/requestQueue";
import type { ContextDispatch, ContextState, ContextProvider, DispatchAction } from ".";
import type { DBResponse, ObjectId } from "types/database";

interface FileContextState extends ContextState {
    loading: boolean
    fetching: boolean
    fileSelected: boolean
    viewMode: boolean
    file: FileData<FileContent, FileMetadata, FileStorage>
    queue: RequestQueue
}

interface KeyValuePair { key: string, value: any }

type FileContextDispatchAction = DispatchAction<ObjectId, "init"> 
    | DispatchAction<DBResponse<FileGetResult>, "initSet">
    | DispatchAction<string, "setText">
    | DispatchAction<KeyValuePair, "setMetadata">
    | DispatchAction<KeyValuePair, "setStorage">

interface FileContextDispatch extends ContextDispatch {
    setText: (text: string) => void
    setMetadata: (key: string, value: any) => void
    setStorage: (key: string, value: any) => void
}


type FileContextProvider = ContextProvider<FileContextState, FileContextDispatch>

export type {
    FileContextProvider,
    FileContextDispatchAction,
    FileContextState,
    FileContextDispatch,
    KeyValuePair
}