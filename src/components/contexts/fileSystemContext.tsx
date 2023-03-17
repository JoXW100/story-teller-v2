import React, { useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router';
import { openPopup } from 'components/common/popupHolder'
import CreateFilePopup from 'components/storyPage/fileSystem/createFilePopup';
import ConfirmationPopup from 'components/common/confirmationPopup';
import Localization from 'utils/localization';
import Communication from 'utils/communication';
import { Context as StoryContext } from "./storyContext";
import { DBResponse, ObjectId } from 'types/database'
import { Callback, FileSystemContextProvider, FileSystemContextState, InputType } from 'types/context/fileSystemContext'
import { FileGetStructureResult, FileRenameResult, FileSetPropertyResult, FileStructure, FileType } from 'types/database/files'
import FileFilterMenu from 'components/storyPage/fileSystem/fileFilterMenu';


export const Context: React.Context<FileSystemContextProvider> = React.createContext([null, null])

const FileSystemContext = ({ children }: React.PropsWithChildren<{}>): JSX.Element => {
    const [context] = useContext(StoryContext);
    const [state, setState] = useState<FileSystemContextState>({
        loading: false,
        fetching: true,
        searchFilter: "",
        fileFilter: Object.values(FileType)
            .reduce((prev, key) => ({ ...prev, [key]: true }), {} as Record<FileType, boolean>),
        showFilterMenu: false,
        files: []
    })
    const router = useRouter();

    const openCreateFileMenu = (type: InputType, holder: ObjectId = context.story.root) => {
        openPopup(
            <CreateFilePopup 
                type={type} 
                callback={(res) => {
                    if (res.type === InputType.Import) {
                        Communication.addFileFromData(context.story.id, holder, res.data.name, res.data.type, res.data.data)
                        .then(() => setState({ ...state, fetching: true}))
                    } else {
                        Communication.addFile(context.story.id, holder, res.data.name, res.data.type)
                        .then(() => setState({ ...state, fetching: true}))
                    }
                }}
            />
        );
    }

    const openRemoveFileMenu = (file: FileStructure) => {
        const optionYes = Localization.toText('create-confirmationYes');
        const optionNo = Localization.toText('create-confirmationNo');
        const selected = context.fileId === file.id;
        openPopup(
            <ConfirmationPopup 
                header={Localization.toText('create-confirmationHeader')} 
                options={[optionYes, optionNo]} 
                callback={(response) => {
                    if (response === optionYes) {
                        Communication.deleteFile(context.story.id, file.id)
                        .then((res) => {
                            if (!res.success) {
                                console.warn(res.result);
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

    const renameFile = (file: FileStructure, name: string, callback: Callback<FileRenameResult>) => {
        Communication.renameFile(context.story.id, file.id, name)
        .then((res) => {
            if (!res.success) {
                console.warn(res.result);
            }
            callback(res);
        })
    }

    const moveFile = (file: FileStructure, target: FileStructure) => {
        Communication.moveFile(context.story.id, file.id, target?.id ?? context.story.root)
        .then((res) => {
            if (!res.success) {
                console.warn(res.result);
            }
            setState({ ...state, fetching: true})
        })
    }

    const setFileState = (file: FileStructure, state: boolean, callback: Callback<FileSetPropertyResult>) => {
        Communication.setFileState(context.story.id, file.id, state)
        .then((res) => {
            if (!res.success) {
                console.warn(res.result);
            }
            if (callback) {
                callback(res);
            }
        })
    }

    const createCopy = (file: FileStructure) => {
        let num = 0;
        let name = file.name;
        try {
            const regex = RegExp(/(.*) \(([0-9]+)\)$/)
            let res = regex.exec(file.name);
            console.log("createCopy-regex", res)
            if (res) {
                let val = parseInt(res[2])
                num = isNaN(val) ? 0 : val
                name = res[1]
            }
        } catch (error) {
            console.error(error)
        }

        let newName = `${name} (${num + 1})`
        console.log("createCopy", newName)
        Communication.addFileCopy(context.story.id, file.holderId, file.id, newName)
        .then((res) => {
            console.log("createCopy-res", res)
            if (!res.success) {
                console.warn(res.result);
            }
            setState({ ...state, fetching: true})
        })
    }

    const setSearchFilter = (filter: string) => {
        setState({ ...state, searchFilter: filter })
    }

    const setFileFilter = (filter: Record<FileType, boolean>) => {
        setState({ ...state, fileFilter: filter })
    }

    const setFileFilterMenuIsOpen = (isOpen: boolean) => {
        setState({ ...state, showFilterMenu: isOpen})
    }

    useEffect(() => {
        if (state.fetching) {
            if (!state.loading) {
                setState({ ...state, loading: true })
            }
            Communication.getFileStructure(context.story.id)
            .then((res: DBResponse<FileGetStructureResult>) => {
                if (res.success) {
                    setState((state) => ({ 
                        ...state, 
                        files: res.result ?? [] 
                    }));
                }
                setState((state) => ({ ...state, loading: false, fetching: false}))
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
            setSearchFilter: setSearchFilter,
            setFileFilter: setFileFilter,
            setShowFilterMenuState: setFileFilterMenuIsOpen,
        }]}>
            { !state.loading && children }
            { state.showFilterMenu && <FileFilterMenu/> }
        </Context.Provider>
    )
}

export default FileSystemContext
