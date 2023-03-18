import type { DBResponse, ObjectId } from "types/database";
import type { FileRenameResult, FileSetPropertyResult, FileStructure, FileType } from "types/database/files";
import type { ContextDispatch, ContextState, ContextProvider } from ".";

interface FileSystemContextState extends ContextState {
    loading: boolean
    fetching: boolean
    searchFilter: string
    fileFilter: Record<FileType, boolean>
    showFilterMenu: boolean
    files: FileStructure[]
}

interface FileSystemContextDispatch extends ContextDispatch {
    openCreateFileMenu: (type: InputType, holder?: ObjectId) => void
    openRemoveFileMenu: (file: FileStructure) => void
    renameFile: (file: FileStructure, name: string, callback?: Callback<FileRenameResult>) => void
    moveFile: (file: FileStructure, target: FileStructure) => void
    setFileState: (file: FileStructure, state: boolean, callback?: Callback<FileSetPropertyResult>) => void
    createCopy: (file: FileStructure) => void,
    setSearchFilter: (filter: string) => void,
    setFileFilter: (filter: Record<FileType, boolean>) => void,
    setShowFilterMenuState: (isOpen: boolean) => void
}

type Callback<T> = (res: DBResponse<T>) => void

type FileSystemContextProvider = ContextProvider<FileSystemContextState, FileSystemContextDispatch>

export enum InputType {
    File = "file",
    Upload = "upload",
    Folder = "folder",
    ImportOld = "importOld",
    Import = "import"
}

export type {
    Callback,
    FileSystemContextProvider,
    FileSystemContextDispatch,
    FileSystemContextState
}