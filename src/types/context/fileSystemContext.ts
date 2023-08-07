import type { DBResponse, ObjectId } from "types/database";
import type { FileRenameResult, FileSetPropertyResult, FileStructure, FileType } from "types/database/files";
import type { ContextDispatch, ContextState, ContextProvider } from ".";

type FileFilter = Record<FileType, boolean> & {
    showEmptyFolders: boolean
}

interface FileSystemContextState extends ContextState {
    loading: boolean
    fetching: boolean
    searchFilter: string
    fileFilter: FileFilter
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
    convert: (file: FileStructure, type: FileType) => void,
    setSearchFilter: (filter: string) => void,
    setFileFilter: (filter: FileFilter) => void,
    setShowFilterMenuState: (isOpen: boolean) => void,
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
    FileFilter,
    Callback,
    FileSystemContextProvider,
    FileSystemContextDispatch,
    FileSystemContextState
}