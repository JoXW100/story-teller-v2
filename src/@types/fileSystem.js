import '@types/database';
/**
 * @typedef FileSystemState
 * @property {boolean} loading
 * @property {boolean} fetching
 * @property {[StructureFile]} files
 */

/**
 * @template T
 * @typedef {(res: DBResponse<T>) => void} Callback
 */

/**
 * @typedef FileSystemContextDispatch
 * @property {(files: [StructureFile]) => JSX.Element} filesToComponent
 * @property {(type: InputType, holder: ?string) => void} openCreateFileMenu
 * @property {(file: StructureFile) => void} openRemoveFileMenu
 * @property {(file: StructureFile, name: string, callback: Callback<?>) => void} renameFile
 * @property {(file: StructureFile, target: StructureFile) => void} moveFile
 * @property {(file: StructureFile, state: bool, callback: Callback<?>) => void} setFileState
 */

/**
 * @typedef {[ context: FileSystemState, dispatch: FileSystemContextDispatch ]} FileSystemContextProvider
 */