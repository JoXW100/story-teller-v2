import type { ContextDispatch, ContextState, ContextProvider } from ".";
import type { DBResponse, ObjectId } from "types/database";
import type { FileRenameResult, FileSetPropertyResult } from "types/database/responses";
import type { FileType, IFileStructure } from "types/database/files";

type FileFilter = Record<FileType, boolean> & {
    showEmptyFolders: boolean
}

interface FileSystemContextState extends ContextState {
    loading: boolean
    fetching: boolean
    searchFilter: string
    fileFilter: FileFilter
    showFilterMenu: boolean
    files: IFileStructure[]
}

interface FileSystemContextDispatch extends ContextDispatch {
    openCreateFileMenu: (type: InputType, holder?: ObjectId | string, local?: boolean) => void
    openRemoveFileMenu: (file: IFileStructure) => void
    renameFile: (file: IFileStructure, name: string, callback?: Callback<FileRenameResult>) => void
    moveFile: (file: IFileStructure, target: IFileStructure) => void
    setFileState: (file: IFileStructure, state: boolean, callback?: Callback<FileSetPropertyResult>) => void
    createCopy: (file: IFileStructure) => void,
    convert: (file: IFileStructure, type: FileType) => void,
    setSearchFilter: (filter: string) => void,
    setFileFilter: (filter: FileFilter) => void,
    setShowFilterMenuState: (isOpen: boolean) => void,
}

type Callback<T> = (res: DBResponse<T>) => void

type FileSystemContextProvider = ContextProvider<FileSystemContextState, FileSystemContextDispatch>

export enum InputType {
    File = "file",
    Upload = "upload",
    UploadResources = "uploadResources",
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