import React, { useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import FileIcon from '@mui/icons-material/InsertDriveFileSharp';
import FolderIcon from '@mui/icons-material/FolderSharp';
import UploadIcon from '@mui/icons-material/Upload';
import { openContext } from "components/contextMenu";
import { openPopup } from "components/popupHolder";
import { Context } from "components/contexts/storyContext";
import { InputType } from "@types/storyPage";
import { FileType } from "@enums/database";
import Localization from "classes/localization";
import CreateFilePopup from "./createFilePopup";
import ConfirmationPopup from "../../common/confirmationPopup";
import Folder from "./folder";
import File from "./file";
import styles from 'styles/storyPage/fileSystem.module.scss';
import '@types/fileSystem';

/** @type {React.Context<import('@types/fileSystem').FileSystemContextProvider>} */
export const FileSystemContext = React.createContext({})

/**
 * @returns {JSX.Element}
 */
const FileSystem = ({ style }) => {
    const [context] = useContext(Context);
    const router = useRouter();

    /** @type {[state: FileSystemState, setState: React.Dispatch<import('@types/fileSystem').FileSystemState>]} */
    const [state, setState] = useState({
        loading: false,
        fetching: true,
        files: []
    })

    /**
     * @param {InputType} type 
     * @param {string} holder 
     */
    const openCreateFileMenu = (type, holder = context.story.root) => {
        openPopup(
            <CreateFilePopup 
                type={type} 
                callback={(response) => {
                    fetch('/api/database/addFile', {
                        method: 'PUT',
                        body: JSON.stringify({ 
                            storyId: context.story.id, 
                            holderId: holder,
                            name: response.data.name, 
                            type: response.data.type
                        })
                    })
                    .then((res) => res.json())
                    .then((res) => !res.success && console.warn(res.result))
                    .finally(() => setState({ ...state, fetching: true}))
                    .catch(console.error);
                }}
            />
        );
    }

    /** @param {StructureFile} file */
    const openRemoveFileMenu = (file) => {
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
                        .then((res) => {
                            !res.success && console.warn(res.result);
                            res.success && selected && router.push('../' + context.story.id)
                        })
                        .finally(() => setState({ ...state, fetching: true}))
                        .catch(console.error);
                    }
                }}  
            />
        )
    }

    /**
     * @param {StructureFile} file 
     * @param {string} name 
     * @param {Callback<?>} callback
     */
    const renameFile = (file, name, callback) => {
        fetch('/api/database/renameFile', {
            method: 'PUT',
            body: JSON.stringify({ 
                storyId: context.story.id, 
                fileId: file.id,
                name: name
            })
        })
        .then((res) => res.json())
        .then((res) => {
            if (!res.success) {
                console.warn(res.result);
            }
            callback(res);
        })
        .catch(console.error);
    }

    /**
     * @param {StructureFile} file 
     * @param {bool} state 
     * @param {Callback<?>} callback
     */
    const setFileState = (file, state, callback) => {
        fetch('/api/database/setFileState', {
            method: 'PUT',
            body: JSON.stringify({
                storyId: context.story.id, 
                fileId: file.id,
                state: state
            })
        })
        .then((res) => res.json())
        .then((res) => {
            if (!res.success) {
                console.warn(res.result);
            }
            callback && callback(res);
        })
        .catch(console.error);
    }

    /**
     * @param {StructureFile} file 
     * @param {StructureFile} target 
     */
    const moveFile = (file, target) => {
        fetch('/api/database/moveFile', {
            method: 'PUT',
            body: JSON.stringify({ 
                storyId: context.story.id, 
                fileId: file.id,
                targetId: target?.id ?? context.story.root
            })
        })
        .then((res) => res.json())
        .then((res) => {
            if (!res.success) {
                console.warn(res.result);
            }
            setState({ ...state, fetching: true})
        })
        .catch(console.error);
    }

    /**
     * @param {[import('@types/database').StructureFile]} files
     * @returns {JSX.Element} 
     */
    const filesToComponent = (files) => {
        var { files, folders } = files
        .reduce((prev, val) => {
            if (val.type === FileType.Folder)
                prev.folders.push(val)
            else 
                prev.files.push(val)
            return prev;
        }, { files: [], folders: []})
        
        var key = 0;
        return [
            ...folders.sort((a,b) => a.name.localeCompare(b.name)).map((x) => <Folder key={key++} file={x}/>),
            ...files.sort((a,b) => a.name.localeCompare(b.name)).map((x) => <File key={key++} file={x}/>)
        ]
    }

    /** @param {React.MouseEvent<HTMLDivElement, React.MouseEvent>} e */
    const handleContext = (e) => {
        e.preventDefault()
        e.stopPropagation()
        openContext([
            { 
                text: Localization.toText('create-fileTooltips'), 
                icon: FileIcon, 
                action: () => openCreateFileMenu(InputType.File)
            },
            { 
                text: Localization.toText('create-folderTooltips'), 
                icon: FolderIcon, 
                action: () => openCreateFileMenu(InputType.Folder)
            },
            { 
                text: Localization.toText('create-uploadTooltips'), 
                icon: UploadIcon, 
                action: () => openCreateFileMenu(InputType.Upload)
            }
        ], { x: e.pageX, y: e.pageY }, true)
    }

    /** @param {React.DragEvent<HTMLDivElement>} e */
    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    }

    /** @param {React.DragEvent<HTMLDivElement>} e */
    const handleDrag = (e) => {
        if (window.dragData?.file) {
            e.preventDefault();
            e.stopPropagation();
    
            window.dragData && (window.dragData.target = null);
        }
    }

    /** @param {React.DragEvent<HTMLDivElement>} e */
    const handleDrop = (e) => {
        if (window.dragData?.file) {
            e.preventDefault();
            e.stopPropagation();
            
            var file = window.dragData?.file;
            if (file && (file.holderId !== context.story.root)) {
                moveFile(file, null)
            }

            window.dragData.target = null;
            window.dragData.file = null;
        }
    }

    useEffect(() => {
        if (state.fetching) {
            !state.loading && setState({ ...state, loading: true})
            fetch(`/api/database/getFileStructure?storyId=${context.story.id}`, { method: 'GET' })
            .then((res) => res.json())
            .then((res) => {
                if (res.success) {
                    setState((state) => ({ ...state, files: res.result ?? [] }));
                    return;
                }
                throw new Error(res.result);
            })
            .finally(() => setState((state) => ({ ...state, loading: false, fetching: false})))
            .catch(console.error)
        }
    }, [state.fetching])

    return (
        <div className={styles.main} style={style}>
            <div className={styles.header}> 
                <div 
                    className={styles.file}
                    onClick={() => openCreateFileMenu(InputType.File)}
                    tooltips={Localization.toText('create-fileTooltips')}
                > 
                    <FileIcon/> 
                </div>
                <div 
                    className={styles.folder}
                    onClick={() => openCreateFileMenu(InputType.Folder)}
                    tooltips={Localization.toText('create-folderTooltips')}
                > 
                    <FolderIcon/> 
                </div>
                <div 
                    className={styles.upload}
                    onClick={() => openCreateFileMenu(InputType.Upload)}
                    tooltips={Localization.toText('create-uploadTooltips')}
                > 
                    <UploadIcon/> 
                </div>
            </div>
            <div 
                className={styles.body} 
                onContextMenu={handleContext}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
            >
                <FileSystemContext.Provider value={[state, { 
                    filesToComponent: filesToComponent,
                    openCreateFileMenu: openCreateFileMenu,
                    openRemoveFileMenu: openRemoveFileMenu,
                    renameFile: renameFile,
                    moveFile: moveFile,
                    setFileState: setFileState
                }]}>
                    { !state.loading && filesToComponent(state.files) }
                </FileSystemContext.Provider>
            </div>
        </div>
    )
}

export default FileSystem;