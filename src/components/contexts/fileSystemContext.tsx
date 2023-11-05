import React, { useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router';
import { openPopup } from 'components/common/popupHolder'
import CreateFilePopup from 'components/storyPage/fileSystem/createFilePopup';
import ConfirmationPopup from 'components/common/confirmationPopup';
import FileFilterMenu from 'components/storyPage/fileSystem/fileFilterMenu';
import { Context as StoryContext } from "./storyContext";
import { CreateFileOptions } from 'data/fileTemplates';
import Localization from 'utils/localization';
import Communication from 'utils/communication';
import Logger from 'utils/logger';
import { isObjectId, isObjectIdOrNull } from 'utils/helpers';
import { ObjectId, DBResponse } from 'types/database'
import { Callback, FileFilter, FileSystemContextProvider, FileSystemContextState, InputType } from 'types/context/fileSystemContext'
import { FileType, IFileStructure, ILocalFile } from 'types/database/files'
import { FileGetStructureResult, FileRenameResult, FileSetPropertyResult } from 'types/database/responses';

const findUniqueId = (existing: string[], initial: string): string => {
    let ids = new Set<string>(existing)
    let id = 1;
    while (ids.has(initial + String(id))) id++;
    return initial + String(id)
}
 
export const Context: React.Context<FileSystemContextProvider> = React.createContext([null, null])

const FileSystemContext = ({ children }: React.PropsWithChildren<{}>): JSX.Element => {
    const router = useRouter();
    const [context, dispatch] = useContext(StoryContext);
    const [state, setState] = useState<FileSystemContextState>({
        loading: false,
        fetching: true,
        searchFilter: "",
        fileFilter: Object.values(FileType).reduce((prev, key) => ({ ...prev, [key]: true }), { showEmptyFolders: true } as FileFilter),
        showFilterMenu: false,
        files: []
    })

    const openCreateFileMenu = (type: InputType, holder: ObjectId | string = context.story.root, local: boolean = false) => {
        openPopup(
            <CreateFilePopup 
                type={type} 
                callback={(res) => {
                    if (res.type === InputType.Import && isObjectId(holder)) {
                        Communication.addFileFromData(context.story.id, holder, res.data.name, res.data.type, res.data.data)
                        .then(() => setState({ ...state, fetching: true}))
                    } else if (res.type === InputType.UploadResources) {
                        dispatch.setLocalFiles(res.resources ?? {}, false)
                    } else if (res.type === InputType.Upload || local) {
                        if (isObjectId(holder)) holder = null
                        let localFile: ILocalFile = {
                            id: findUniqueId(Object.keys(context.localFiles), res.data.name),
                            holderId: String(holder),
                            type: res.data.type === FileType.Folder ? FileType.LocalFolder : res.data.type,
                            name: res.data.name,
                            data: res.data.file ?? null
                        }
                        dispatch.setLocalFiles({ ...context.localFiles, [localFile.id]: localFile })
                    } else if (isObjectId(holder)) {
                        Communication.addFile(context.story.id, holder, res.data.name, res.data.type)
                        .then(() => setState({ ...state, fetching: true}))
                    }
                }}
            />
        );
    }

    const openRemoveFileMenu = (file: IFileStructure) => {
        const optionYes = Localization.toText('create-confirmationYes');
        const optionNo = Localization.toText('create-confirmationNo');
        const selected = context.fileId === file.id;
        openPopup(
            <ConfirmationPopup 
                header={Localization.toText('create-confirmationHeader')} 
                description={Localization.toText('create-confirmationDeleteDescription', file.name)}
                options={[optionYes, optionNo]} 
                callback={(response) => {
                    if (response === optionYes) {
                        if (isObjectId(file.id)) {
                            Communication.deleteFile(context.story.id, file.id)
                            .then((res) => {
                                if (!res.success) {
                                    Logger.warn("FileSystemContext.openRemoveFileMenu", res.result);
                                } else if (selected) {
                                    router.push('../' + context.story.id)
                                }
                                setState({ ...state, fetching: true})
                            })
                        } else if (file.type === FileType.LocalFolder || file.type === FileType.LocalImage) {
                            let files = {...context.localFiles}
                            delete files[file.id]
                            dispatch.setLocalFiles(files)
                        }
                    }
                }}  
            />
        )
    }

    const openConvertFileMenu = (file: IFileStructure, type: FileType) => {
        const optionYes = Localization.toText('create-confirmationYes');
        const optionNo = Localization.toText('create-confirmationNo');
        const selected = context.fileId === file.id;
        openPopup(
            <ConfirmationPopup 
                header={Localization.toText('create-confirmationHeader')} 
                description={Localization.toText('create-confirmationConvertDescription', file.name, CreateFileOptions[type])}
                options={[optionYes, optionNo]} 
                callback={(response) => {
                    if (response === optionYes && isObjectId(file.id)) {
                        Communication.convertFile(context.story.id, file.id, type)
                        .then((res) => {
                            if (!res.success) {
                                Logger.warn("FileSystemContext.openRemoveFileMenu", res.result);
                            } else if (selected) {
                                router.push('../' + context.story.id)
                            }
                            setState({ ...state, fetching: true})
                        })
                    }
                }}  
            />
        )
    }

    const renameFile = (file: IFileStructure, name: string, callback: Callback<FileRenameResult>) => {
        if (isObjectId(file.id)) {
            Communication.renameFile(context.story.id, file.id, name)
            .then((res) => {
                if (!res.success) {
                    Logger.warn("FileSystemContext.renameFile", res.result);
                }
                if (callback) {
                    callback(res);
                }
            })
        } else if (file.type === FileType.LocalFolder || file.type === FileType.LocalImage) {
            let newFile = { ...context.localFiles[file.id], name: name }
            dispatch.setLocalFiles({...context.localFiles, [file.id]: newFile })
        }
    }

    const moveFile = (file: IFileStructure, target: IFileStructure) => {
        let targetId = target?.id ?? context.story.root
        if (isObjectId(file.id) && isObjectId(targetId)) {
            Communication.moveFile(context.story.id, file.id, targetId)
            .then((res) => {
                if (!res.success) {
                    Logger.warn("FileSystemContext.moveFile", res.result);
                }
                setState({ ...state, fetching: true})
            })
        } else if ((file.type === FileType.LocalFolder || file.type === FileType.LocalImage)
            && (!target?.id || target.type === FileType.LocalFolder || target.type === FileType.LocalImage)) {
            dispatch.setLocalFiles({ 
                ...context.localFiles, 
                [String(file.id)]: { 
                    ...context.localFiles[String(file.id)], 
                    holderId: target?.id ? String(target.id) : null
                }
            })
        }
    }

    const setFileState = (file: IFileStructure, state: boolean, callback: Callback<FileSetPropertyResult>) => {
        if (isObjectId(file.id)) {
            Communication.setFileState(context.story.id, file.id, state)
            .then((res) => {
                if (!res.success) {
                    Logger.warn("FileSystemContext.setFileState", res.result);
                }
                if (callback) {
                    callback(res);
                }
            })
        }
    }

    const createCopy = (file: IFileStructure) => {
        if (!isObjectId(file.id) || !isObjectIdOrNull(file.holderId)) return;
        let num = 0;
        let name = file.name;
        const regex = RegExp(/(.*) \(([0-9]+)\)$/)
        const match = regex.exec(file.name);
        if (match) {
            let val = parseInt(match[2])
            num = isNaN(val) ? 0 : val
            name = match[1]
        }
        let newName = `${name} (${num + 1})`
        Communication.addFileCopy(context.story.id, file.holderId, file.id, newName)
        .then((res) => {
            if (!res.success) {
                Logger.warn("FileSystemContext.createCopy", res.result);
            }
            setState({ ...state, fetching: true})
        })
    }

    const setSearchFilter = (filter: string) => {
        setState({ ...state, searchFilter: filter })
    }

    const setFileFilter = (filter: FileFilter) => {
        setState({ ...state, fileFilter: filter })
    }

    const setFileFilterMenuIsOpen = (isOpen: boolean) => {
        setState({ ...state, showFilterMenu: isOpen})
    }

    useEffect(() => {
        Logger.log("fileSystemContext", state.fetching ? "fetching..." : "done")
        if (state.fetching) {
            if (!state.loading) {
                setState({ ...state, loading: true })
            }
            Communication.getFileStructure(context.story.id)
            .then((res: DBResponse<FileGetStructureResult>) => {
                if (res.success) {
                    setState((state) => ({ ...state, files: res.result ?? [] }));
                }
                setState((state) => ({ ...state, loading: false, fetching: false }))
            })
        }
    }, [state.fetching])

    return (
        <Context.Provider value={[state, {
            openCreateFileMenu: openCreateFileMenu,
            openRemoveFileMenu: openRemoveFileMenu,
            renameFile: renameFile,
            moveFile: moveFile,
            setFileState: setFileState,
            createCopy: createCopy,
            convert: openConvertFileMenu,
            setSearchFilter: setSearchFilter,
            setFileFilter: setFileFilter,
            setShowFilterMenuState: setFileFilterMenuIsOpen
        }]}>
            { !state.loading && children }
            { state.showFilterMenu && <FileFilterMenu/> }
        </Context.Provider>
    )
}

export default FileSystemContext
