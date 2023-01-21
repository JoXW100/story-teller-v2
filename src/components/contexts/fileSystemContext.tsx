import React, { useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router';
import { openPopup } from 'components/common/popupHolder'
import File from 'components/storyPage/fileSystem/file'
import CreateFilePopup from 'components/storyPage/fileSystem/createFilePopup';
import Folder from 'components/storyPage/fileSystem/folder'
import ConfirmationPopup from 'components/common/confirmationPopup';
import Localization from 'utils/localization';
import Communication from 'utils/communication';
import { Context as StoryContext } from "./storyContext";
import { DBResponse, ObjectId } from 'types/database'
import { Callback, FileSystemContextProvider, FileSystemContextState, InputType } from 'types/context/fileSystemContext'
import { FileGetStructureResult, FileRenameResult, FileSetPropertyResult, FileStructure, FileType } from 'types/database/files'


export const Context: React.Context<FileSystemContextProvider> = React.createContext([null, null])

const FileSystemContext = ({ children }: React.PropsWithChildren<{}>): JSX.Element => {
    const [context] = useContext(StoryContext);
    const [state, setState] = useState<FileSystemContextState>({
        loading: false,
        fetching: true,
        files: []
    })
    const router = useRouter();

    const filesToComponent = (files: FileStructure[]): JSX.Element[] => {
        var { files, folders } = files.reduce((prev, val) => (
            val.type === FileType.Folder 
            ? { ...prev, folders: [...prev.folders, val] }
            : { ...prev, files: [...prev.files, val] }
        ), { files: [], folders: []} as { files: FileStructure[], folders: FileStructure[]})
        return [
            ...folders.sort((a,b) => a.name.localeCompare(b.name)).map((x) => (
                <Folder key={String(x.id)} file={x}/>
            )),
            ...files.sort((a,b) => a.name.localeCompare(b.name)).map((x) => (
                <File key={String(x.id)} file={x}/>
            ))
        ]
    }

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
                        files: res.result as FileGetStructureResult ?? [] 
                    }));
                }
                setState((state) => ({ ...state, loading: false, fetching: false}))
            })
        }
    }, [state.fetching])

    return (
        <Context.Provider value={[state, { 
            filesToComponent: filesToComponent,
            openCreateFileMenu: openCreateFileMenu,
            openRemoveFileMenu: openRemoveFileMenu,
            renameFile: renameFile,
            moveFile: moveFile,
            setFileState: setFileState
        }]}>
            { !state.loading && children }
        </Context.Provider>
    )
}

export default FileSystemContext
