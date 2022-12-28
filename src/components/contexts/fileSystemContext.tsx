import React, { useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router';
import { openPopup } from 'components/common/popupHolder'
import File from 'components/storyPage/fileSystem/file'
import CreateFilePopup from 'components/storyPage/fileSystem/createFilePopup';
import Folder from 'components/storyPage/fileSystem/folder'
import ConfirmationPopup from 'components/common/confirmationPopup';
import Localization from 'utils/localization';
import { Context as StoryContext } from "./storyContext";
import { DBResponse, ObjectId } from 'types/database'
import { Callback, FileSystemContextProvider, FileSystemContextState, InputType } from 'types/context/fileSystemContext'
import { FileAddResult, FileDeleteFromResult, FileGetStructureResult, FileMoveResult, FileRenameResult, FileSetPropertyResult, FileStructure, FileType } from 'types/database/files'

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
        
        var key = 0;
        return [
            ...folders.sort((a,b) => a.name.localeCompare(b.name)).map((x) => (
                <Folder key={key++} file={x}/>
            )),
            ...files.sort((a,b) => a.name.localeCompare(b.name)).map((x) => (
                <File key={key++} file={x}/>
            ))
        ]
    }

    const openCreateFileMenu = (type: InputType, holder: ObjectId = context.story.root) => {
        openPopup(
            <CreateFilePopup 
                type={type} 
                callback={(res) => {
                    fetch(`/api/database/${res.type === InputType.Import ? 'addFileFromData' : 'addFile'}`, {
                        method: 'PUT',
                        body: JSON.stringify({ 
                            storyId: context.story.id, 
                            holderId: holder,
                            name: res.data.name, 
                            type: res.data.type,
                            data: res.data.data
                        })
                    })
                    .then((res) => res.json())
                    .then((res: DBResponse<FileAddResult>) => {
                        if (!res.success)
                            console.warn(res.result)
                    })
                    .finally(() => setState({ ...state, fetching: true}))
                    .catch(console.error);
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
                        fetch('/api/database/deleteFile', {
                            method: 'DELETE',
                            body: JSON.stringify({ 
                                storyId: context.story.id, 
                                fileId: file.id 
                            })
                        })
                        .then((res) => res.json())
                        .then((res: DBResponse<FileDeleteFromResult>) => {
                            if (!res.success) {
                                console.warn(res.result);
                            } else if (selected) {
                                router.push('../' + context.story.id)
                            }
                        })
                        .finally(() => setState({ ...state, fetching: true}))
                        .catch(console.error);
                    }
                }}  
            />
        )
    }

    const renameFile = (file: FileStructure, name: string, callback: Callback<FileRenameResult>) => {
        fetch('/api/database/renameFile', {
            method: 'PUT',
            body: JSON.stringify({ 
                storyId: context.story.id, 
                fileId: file.id,
                name: name
            })
        })
        .then((res) => res.json())
        .then((res: DBResponse<FileRenameResult>) => {
            if (!res.success) {
                console.warn(res.result);
            }
            callback(res);
        })
        .catch(console.error);
    }

    const moveFile = (file: FileStructure, target: FileStructure) => {
        fetch('/api/database/moveFile', {
            method: 'PUT',
            body: JSON.stringify({ 
                storyId: context.story.id, 
                fileId: file.id,
                targetId: target?.id ?? context.story.root
            })
        })
        .then((res) => res.json())
        .then((res: DBResponse<FileMoveResult>) => {
            if (!res.success) {
                console.warn(res.result);
            }
            setState({ ...state, fetching: true})
        })
        .catch(console.error);
    }

    const setFileState = (file: FileStructure, state: boolean, callback: Callback<FileSetPropertyResult>) => {
        fetch('/api/database/setFileState', {
            method: 'PUT',
            body: JSON.stringify({
                storyId: context.story.id, 
                fileId: file.id,
                state: state
            })
        })
        .then((res) => res.json())
        .then((res: DBResponse<FileSetPropertyResult>) => {
            if (!res.success) {
                console.warn(res.result);
            }
            callback && callback(res);
        })
        .catch(console.error);
    }

    useEffect(() => {
        if (state.fetching) {
            !state.loading && setState({ ...state, loading: true})
            fetch(`/api/database/getFileStructure?storyId=${context.story.id}`, { method: 'GET' })
            .then((res) => res.json())
            .then((res: DBResponse<FileGetStructureResult>) => {
                if (!res.success)
                    throw new Error(res.result as string);
                setState((state) => ({ 
                    ...state, 
                    files: res.result as FileGetStructureResult ?? [] 
                }));
                
            })
            .finally(() => setState((state) => ({ ...state, loading: false, fetching: false})))
            .catch(console.error)
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
