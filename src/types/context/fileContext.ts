import type { FileData } from "types/database/files";
import type RequestQueue from "utils/data/requestQueue";
import type { ContextDispatch, ContextState, ContextProvider } from ".";

interface FileContextState extends ContextState {
    loading: boolean
    fetching: boolean
    fileSelected: boolean
    file: FileData<any, any>
    queue: RequestQueue
}

interface FileContextDispatch extends ContextDispatch {
    setText: (text: string) => void
    setMetadata: (key: string, value: any) => void
}


type FileContextProvider = ContextProvider<FileContextState, FileContextDispatch>

export type {
    FileContextProvider,
    FileContextState,
    FileContextDispatch
}