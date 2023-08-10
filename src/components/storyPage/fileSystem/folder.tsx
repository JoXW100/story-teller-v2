import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Context } from 'components/contexts/fileSystemContext';
import { Context as StoryContext } from 'components/contexts/storyContext';
import { Context as AppContext } from 'components/contexts/appContext';
import { openContext } from 'components/common/contextMenu';
import Localization from 'utils/localization';
import IconClosed from '@mui/icons-material/FolderSharp';
import IconOpen from '@mui/icons-material/FolderOpenSharp';
import FileIcon from '@mui/icons-material/InsertDriveFileSharp';
import ImportIcon from '@mui/icons-material/DownloadSharp';
import RemoveIcon from '@mui/icons-material/Remove';
import RenameIcon from '@mui/icons-material/DriveFileRenameOutline';
import { FileStructure } from 'types/database/files';
import { ObjectId } from 'types/database';
import { InputType } from 'types/context/fileSystemContext';
import styles from 'styles/pages/storyPage/file.module.scss';

const hasSelectedChild = (file: FileStructure, fileId: ObjectId): boolean => {
    return file.id === fileId || file.children?.some((x) => hasSelectedChild(x, fileId)) 
}

const containsFile = (file: FileStructure, holder: FileStructure): boolean => {
    return file.id == holder.id || holder.children?.some((x) => containsFile(file, x));
}

type FolderProps = React.PropsWithChildren<{
    file: FileStructure
}>

const Folder = ({ file, children }: FolderProps): JSX.Element => {
    const [app] = useContext(AppContext);
    const [context] = useContext(StoryContext);
    const [_, dispatch] = useContext(Context);
    const [state, setState] = useState({
        open: Boolean(file.open),
        highlight: false,
        inEditMode: false,
        selected: context.fileId == file.id,
        text: file.name
    });
    const ref = useRef<HTMLInputElement>()
    const contextID = file.id + "-context-rename-item"
    const Icon = useMemo(() => state.open ? IconOpen : IconClosed, [state.open])

    const cancelEdit = () => {
        setState({ ...state, inEditMode: false })
    }

    const breakEdit = () => {
        setState({ ...state, text: file.name, inEditMode: false })
    }

    const changeState = () => {
        if (!state.inEditMode) {
            let value = { ...state, open: !state.open }
            setState(value);
            dispatch.setFileState(file, value.open);
        }
    }

    const handleKey = (e: KeyboardEvent) => {
        if (e.code == 'F2' && context.fileId == file.id) {
            setState({ ...state, inEditMode: !state.inEditMode })
        }
    }

    const handleEvent = (e: MouseEvent) => {
        let target = e.target as any
        if (state.inEditMode && target !== ref.current && target?.id != contextID) {
            cancelEdit()
        }
    }

    const handleContext = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault()
        e.stopPropagation()
        openContext([
            { 
                text: Localization.toText('create-fileTooltips'), 
                icon: FileIcon, 
                action: () => dispatch.openCreateFileMenu(InputType.File, file.id)
            },
            { 
                text: Localization.toText('create-folderTooltips'), 
                icon: IconClosed, 
                action: () => dispatch.openCreateFileMenu(InputType.Folder, file.id)
            },
            /**
            { 
                text: Localization.toText('create-uploadTooltips'), 
                icon: UploadIcon, 
                action: () => dispatch.openCreateFileMenu(InputType.Upload, file.id)
            }
            */
            {
                text: Localization.toText('create-importTooltips'), 
                icon: ImportIcon, 
                action: () => dispatch.openCreateFileMenu(InputType.Import, file.id)
            },
            { 
                text: Localization.toText('create-rename'), 
                icon: RenameIcon,
                id: contextID,
                action: () => setState((state) => ({ ...state, inEditMode: true }))
            },
            { 
                text: Localization.toText('create-delete'), 
                icon: RemoveIcon, 
                action: () => dispatch.openRemoveFileMenu(file)
            }
        ], { x: e.pageX, y: e.pageY }, true)
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        if (window.dragData?.file) {
            e.preventDefault();
            e.stopPropagation();
            let drag: FileStructure = window.dragData.file;
            if (drag && drag.holderId !== file.id && !containsFile(file, drag)) {
                dispatch.moveFile(drag, file)
            }
            window.dragData.target = null;
            window.dragData.file = null;
            setState((state) => ({ ...state, highlight: false }));
        }
    }

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        if (window.dragData?.file) {
            e.preventDefault();
            e.stopPropagation();
        }
    }

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        if (window.dragData?.file) {
            e.preventDefault();
            e.stopPropagation();
            let drag = window.dragData.file;
            if (window.dragData.target !== file.id && drag.holderId !== file.id) {
                window.dragData.target = file.id;
                setState((state) => ({ ...state, highlight: true }));
            }
        }
    }

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        if (window.dragData?.file) {
            e.preventDefault();
            if (window.dragData.target !== file.id) {
                setState((state) => ({ ...state, highlight: false }));
            }
        }
    }

    const handleDrag = () => {
        window.dragData = { file: file }
    }

    const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        setState({ ...state, text: e.target.value })
    }

    useEffect(() => {
        if (!state.inEditMode && state.text !== file.name) {
            dispatch.renameFile(file, state.text, (res) => {
                if (res.success) {
                    file.name = state.text;
                }
                setState((state) => ({ ...state, inEditMode: false }))
            })
        }
    }, [state.inEditMode])

    useEffect(() => {
        if (state.inEditMode) {
            ref.current?.select()
            window.addEventListener('click', handleEvent)
            window.addEventListener('contextmenu', handleEvent)
            return () => {
                window.removeEventListener('click', handleEvent)
                window.removeEventListener('contextmenu', handleEvent)
            }
        }
    }, [state.inEditMode])

    useEffect(() => {
        setState((state) => ({ ...state, selected: context.fileId == file.id || hasSelectedChild(file, context.fileId)}));
        if (context.fileId == file.id) {
            window.addEventListener('keydown', handleKey, true)
            return () => {
                window.addEventListener('keydown', handleKey, true)
            }
        }
    }, [context.fileId, file.id])

    const className = !state.open && state.selected
        ? `${styles.folder} ${styles.selected}` 
        : styles.folder;

    return (
        <div 
            className={styles.folderHolder} 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDragEnter={handleDragEnter}
            onDrop={handleDrop}
            data={state.highlight ? "highlight" : undefined}
        >
            <button 
                className={className} 
                onClick={changeState}
                onDragStart={handleDrag}
                onContextMenu={handleContext}
                data={app.enableColorFileByType ? file.type : undefined}
                value={state.open ? "open" : "closed"}
                draggable={!state.inEditMode}
            >
                <Icon/>
                <input 
                    ref={ref}
                    type='text'
                    spellCheck='false'
                    disabled={!state.inEditMode} 
                    onChange={handleChange} 
                    onKeyDown={(e) => {
                        if (e.key == 'Enter') {
                            cancelEdit()
                        }
                        if (e.key == 'Escape') {
                            breakEdit()
                        }
                    }}
                    value={state.text}
                />
            </button>
            
            { state.open && file.children && (
                <div className={styles.content}>
                    { children }
                </div>
            )}
        </div>
    )
}

export default Folder;