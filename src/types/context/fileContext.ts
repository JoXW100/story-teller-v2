import type { FileContent, FileData, FileMetadata, FileStorage } from "types/database/files";
import type RequestQueue from "utils/data/requestQueue";
import type { ContextDispatch, ContextState, ContextProvider } from ".";

interface FileContextState extends ContextState {
    loading: boolean
    fetching: boolean
    fileSelected: boolean
    viewMode: boolean
    file: FileData<FileContent, FileMetadata, FileStorage>
    queue: RequestQueue
}

interface FileContextDispatch extends ContextDispatch {
    setText: (text: string) => void
    setMetadata: (key: string, value: any) => void
    setStorage: (key: string, value: any) => void
}


type FileContextProvider = ContextProvider<FileContextState, FileContextDispatch>

export type {
    FileContextProvider,
    FileContextState,
    FileContextDispatch
}