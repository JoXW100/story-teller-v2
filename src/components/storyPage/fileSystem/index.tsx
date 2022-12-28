import React, { useContext } from "react";
import { openContext } from "components/common/contextMenu";
import { Context as StoryContext } from "components/contexts/storyContext";
import FileSystemContext, { Context } from "components/contexts/fileSystemContext";
import Localization from "utils/localization";
import FileIcon from '@mui/icons-material/InsertDriveFileSharp';
import FolderIcon from '@mui/icons-material/FolderSharp';
import UploadIcon from '@mui/icons-material/Upload';
import ImportIcon from '@mui/icons-material/DownloadSharp';
import { InputType } from "types/context/fileSystemContext";
import styles from 'styles/storyPage/fileSystem.module.scss';

const FileSystem = (): JSX.Element => {
    return (
        <div className={styles.main}>
            <FileSystemContext>
                <FileMenuHeader/>
                <FileMenu/>
            </FileSystemContext>
        </div>
    )
}

const FileMenuHeader = (): JSX.Element => {
    const [_, dispatch] = useContext(Context)
    return (
        <div className={styles.header}> 
            <div 
                onClick={() => dispatch.openCreateFileMenu(InputType.File)}
                tooltips={Localization.toText('create-fileTooltips')}
            > 
                <FileIcon/> 
            </div>
            <div 
                onClick={() => dispatch.openCreateFileMenu(InputType.Folder)}
                tooltips={Localization.toText('create-folderTooltips')}
            > 
                <FolderIcon/> 
            </div>
            {/**
            <div 
                className={styles.upload}
                onClick={() => dispatch.openCreateFileMenu(InputType.Upload)}
                tooltips={Localization.toText('create-uploadTooltips')}
            > 
                <UploadIcon/> 
            </div>
             */}
            <div 
                onClick={() => dispatch.openCreateFileMenu(InputType.Import)}
                tooltips={Localization.toText('create-importTooltips')}
            > 
                <ImportIcon/> 
            </div>
        </div>
    )
}

const FileMenu = (): JSX.Element => {
    const [storyContext] = useContext(StoryContext);
    const [context, dispatch] = useContext(Context)

    const handleContext = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.preventDefault()
        e.stopPropagation()
        openContext([
            { 
                text: Localization.toText('create-fileTooltips'), 
                icon: FileIcon, 
                action: () => dispatch.openCreateFileMenu(InputType.File)
            },
            { 
                text: Localization.toText('create-folderTooltips'), 
                icon: FolderIcon, 
                action: () => dispatch.openCreateFileMenu(InputType.Folder)
            },
            { 
                text: Localization.toText('create-uploadTooltips'), 
                icon: UploadIcon, 
                action: () => dispatch.openCreateFileMenu(InputType.Upload)
            }
        ], { x: e.pageX, y: e.pageY }, true)
    }

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    }

    const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
        if (window.dragData?.file) {
            e.preventDefault();
            e.stopPropagation();
            window.dragData && (window.dragData.target = null);
        }
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        if (window.dragData?.file) {
            e.preventDefault();
            e.stopPropagation();
            
            var file = window.dragData?.file;
            if (file && (file.holderId !== storyContext.story.root)) {
                dispatch.moveFile(file, null)
            }

            window.dragData.target = null;
            window.dragData.file = null;
        }
    }
    
    return (
        <div 
            className={styles.body} 
            onContextMenu={handleContext}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
        >
            { dispatch.filesToComponent(context.files) }
        </div>
    )
}

export default FileSystem;