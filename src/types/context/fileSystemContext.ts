import { DBResponse, ObjectId } from "types/database";
import { FileRenameResult, FileSetPropertyResult, FileStructure } from "types/database/files";
import type { ContextDispatch, ContextState, ContextProvider } from ".";

interface FileSystemContextState extends ContextState {
    loading: boolean
    fetching: boolean
    files: FileStructure[]
}

interface FileSystemContextDispatch extends ContextDispatch {
    filesToComponent: (files: FileStructure[]) => JSX.Element[]
    openCreateFileMenu: (type: InputType, holder?: ObjectId) => void
    openRemoveFileMenu: (file: FileStructure) => void
    renameFile: (file: FileStructure, name: string, callback?: Callback<FileRenameResult>) => void
    moveFile: (file: FileStructure, target: FileStructure) => void
    setFileState: (file: FileStructure, state: boolean, callback?: Callback<FileSetPropertyResult>) => void
    createCopy: (file: FileStructure) => void
}

type Callback<T> = (res: DBResponse<T>) => void

type FileSystemContextProvider = ContextProvider<FileSystemContextState, FileSystemContextDispatch>

export enum InputType {
    File = "file",
    Upload = "upload",
    Folder = "folder",
    Import = "import"
}

export type {
    Callback,
    FileSystemContextProvider,
    FileSystemContextDispatch,
    FileSystemContextState
}