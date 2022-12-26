import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Context as StoryContext } from 'components/contexts/storyContext';
import { Context } from 'components/contexts/fileSystemContext';
import { openContext } from 'components/common/contextMenu';
import Localization from 'utils/localization';
import IconClosed from '@mui/icons-material/FolderSharp';
import IconOpen from '@mui/icons-material/FolderOpenSharp';
import FileIcon from '@mui/icons-material/InsertDriveFileSharp';
import UploadIcon from '@mui/icons-material/Upload';
import RemoveIcon from '@mui/icons-material/Remove';
import RenameIcon from '@mui/icons-material/DriveFileRenameOutline';
import FileInput from './fileInput';
import { FileStructure } from 'types/database/files';
import { ObjectId } from 'types/database';
import { InputType } from 'types/context/fileSystemContext';
import { DragData } from 'index';
import styles from 'styles/storyPage/file.module.scss';

const hasSelectedChild = (file: FileStructure, fileId: ObjectId): boolean => {
    return file.id === fileId || file.children?.some((x) => hasSelectedChild(x, fileId)) 
}

const containsFile = (file: FileStructure, holder: FileStructure): boolean => {
    return file.id == holder.id || holder.children?.some((x) => containsFile(file, x));
}

type FolderProps = React.PropsWithRef<{
    file: FileStructure
}>

const Folder = ({ file }: FolderProps): JSX.Element => {
    const [context] = useContext(StoryContext);
    const [_, dispatch] = useContext(Context);
    const [state, setState] = useState({
        open: Boolean(file.open),
        selected: false,
        highlight: false,
        inEditMode: false,
        text: file.name
    });

    const Icon = useMemo(() => state.open ? IconOpen : IconClosed, [state.open])

    const changeState = () => {
        var value = { ...state, open: !state.open }
        setState(value);
        dispatch.setFileState(file, value.open);
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
        setState((state) => ({ ...state, selected: hasSelectedChild(file, context.fileId)}));
    }, [context.fileId])

    const handleContext = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
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
            { 
                text: Localization.toText('create-uploadTooltips'), 
                icon: UploadIcon, 
                action: () => dispatch.openCreateFileMenu(InputType.Upload, file.id)
            },
            { 
                text: Localization.toText('create-rename'), 
                icon: RenameIcon, 
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
        var data: DragData = window.dragData
        if (data?.file) {
            e.preventDefault();
            e.stopPropagation();
            
            var drag: FileStructure = data.file;
            if (drag && drag.holderId !== file.id && !containsFile(file, drag)) {
                dispatch.moveFile(drag, file)
            }
            data.target = null;
            data.file = null;
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
        var data: { file?: FileStructure, target?: ObjectId } = window.dragData
        if (data?.file) {
            e.preventDefault();
            e.stopPropagation();
            var drag = data.file;
            if (data.target !== file.id && drag.holderId !== file.id) {
                data.target = file.id;
                setState((state) => ({ ...state, highlight: true }));
            }
        }
    }

    const handleDrag = () => {
        window.dragData = { file: file }
    }

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        if (window.dragData?.file) {
            e.preventDefault();
            if (window.dragData.target !== file.id) {
                setState((state) => ({ ...state, highlight: false }));
            }
        }
    }

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
            <div 
                className={className} 
                onClick={changeState}
                onDragStart={handleDrag}
                onContextMenu={handleContext}
                data={state.open ? "open" : "closed"}
                draggable
            >
                <Icon/>
                { state.inEditMode 
                    ?  <FileInput state={state} setState={setState}/> 
                    : <div className={styles.text}> {file.name} </div>
                }
            </div>
            
            { state.open && file.children && (
                <div className={styles.content}>
                    { dispatch.filesToComponent(file.children)}
                </div>
            )}
        </div>
    )
}

export default Folder;