import React, { useContext, useEffect, useMemo, useState } from 'react';
import IconClosed from '@mui/icons-material/FolderSharp';
import IconOpen from '@mui/icons-material/FolderOpenSharp';
import FileIcon from '@mui/icons-material/InsertDriveFileSharp';
import UploadIcon from '@mui/icons-material/Upload';
import RemoveIcon from '@mui/icons-material/Remove';
import RenameIcon from '@mui/icons-material/DriveFileRenameOutline';
import { Context } from 'components/contexts/storyContext';
import { FileSystemContext } from './fileSystem';
import { openContext } from 'components/contextMenu';
import { InputType } from '@types/storyPage';
import FileInput from './fileInput';
import Localization from 'classes/localization';
import styles from 'styles/storyPage/file.module.scss';
import '@types/fileSystem';

const hasSelectedChild = (file, fileId) => {
    return file.id === fileId || file.children?.some((x) => hasSelectedChild(x, fileId)) 
}

/**
 * @param {{ file: StructureFile }}
 * @returns {JSX.Element}
 */
const Folder = ({ file }) => {
    const [context] = useContext(Context);
    const [_, dispatch] = useContext(FileSystemContext);
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

    /** @param {React.MouseEvent<HTMLDivElement, React.MouseEvent>} e */
    const handleContext = (e) => {
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

    /** 
     * @param {import('@types/database').StructureFile} file
     * @param {import('@types/database').StructureFile} holder
     */
    const containsFile = (file, holder) => 
    {
        return file.id == holder.id || holder.children.some((x) => containsFile(file, x));
    }

    /** @param {React.DragEvent<HTMLDivElement>} e */
    const handleDrop = (e) => {
        if (window.dragData?.file) {
            e.preventDefault();
            e.stopPropagation();
            
            /** @type {import('@types/database').StructureFile} */
            var drag = window.dragData?.file;
            if (drag && drag.holderId !== file.id && !containsFile(file, drag)) {
                dispatch.moveFile(drag, file)
            }

            window.dragData.target = null;
            window.dragData.file = null;
            setState((state) => ({ ...state, highlight: false }));
        }
    }

    /** @param {React.DragEvent<HTMLDivElement>} e */
    const handleDragOver = (e) => {
        if (window.dragData?.file) {
            e.preventDefault();
            e.stopPropagation();
        }
    }

    /** @param {React.DragEvent<HTMLDivElement>} e */
    const handleDragEnter = (e) => {
        if (window.dragData?.file) {
            e.preventDefault();
            e.stopPropagation();
            var drag = window.dragData?.file;
            if (window.dragData.target !== file.id && drag.holderId !== file.id) {
                window.dragData.target = file.id;
                setState((state) => ({ ...state, highlight: true }));
            }
        }
    }

    const handleDrag = () => {
        window.dragData = { file: file }
    }

    /** @param {React.DragEvent<HTMLDivElement>} e */
    const handleDragLeave = (e) => {
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
            highlight={state.highlight.toString()}
        >
            <div 
                className={className} 
                onClick={changeState}
                onDragStart={handleDrag}
                onContextMenu={handleContext}
                open={state.open}
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