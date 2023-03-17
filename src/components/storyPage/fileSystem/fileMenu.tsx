import React, { useContext, useMemo } from "react";
import FileIcon from '@mui/icons-material/InsertDriveFileSharp';
import FolderIcon from '@mui/icons-material/FolderSharp';
import UploadIcon from '@mui/icons-material/Upload';
import ImportIcon from '@mui/icons-material/DownloadSharp';
import { openContext } from "components/common/contextMenu";
import { Context as StoryContext } from "components/contexts/storyContext";
import { Context } from "components/contexts/fileSystemContext";
import Folder from "./folder";
import File from "./file";
import Localization from "utils/localization";
import { InputType } from "types/context/fileSystemContext";
import { FileStructure, FileType } from "types/database/files";
import styles from 'styles/storyPage/fileSystem.module.scss';

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
            /*
            { 
                text: Localization.toText('create-uploadTooltips'), 
                icon: UploadIcon, 
                action: () => dispatch.openCreateFileMenu(InputType.Upload)
            }
            */
            {
                text: Localization.toText('create-importTooltips'), 
                icon: ImportIcon, 
                action: () => dispatch.openCreateFileMenu(InputType.Import)
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

    const buildFileStructure = (file: FileStructure): JSX.Element => {
        if (file.type === FileType.Folder) {
            return (
                <Folder key={String(file.id)} file={file}>
                    { file.children?.map((file) => buildFileStructure(file)) }
                </Folder>
            )
        } else {
            return (
                <File key={String(file.id)} file={file}/>
            )
        }
    }

    const matchSearch = (file: FileStructure): boolean => {
        return file.name.toLowerCase().includes(context.searchFilter.toLowerCase())
    }

    const filterFileStructure = (structure: FileStructure[]): FileStructure[] => {
        let { files, folders } = structure.reduce((prev, val) => {
            if (val.type === FileType.Folder) {
                // Don't modify the structure children directly
                let folder = { ...val, children: filterFileStructure(val.children ?? []) }
                if (matchSearch(folder) || folder.children.length > 0) {
                    return { ...prev, folders: [...prev.folders, folder] }
                }
            } else if (context.fileFilter[val.type] && matchSearch(val)) {
                return { ...prev, files: [...prev.files, val] }
            }
            return prev
        }, { files: [], folders: []} as { files: FileStructure[], folders: FileStructure[]})

        return [
            ...folders.sort((a,b) => a.name.localeCompare(b.name)), 
            ...files.sort((a,b) => a.name.localeCompare(b.name))
        ]
    }


    const children = useMemo<JSX.Element[]>(() => {
        return filterFileStructure(context.files).map(buildFileStructure)
    }, [context.files, context.fileFilter, context.searchFilter]);
    
    return (
        <div 
            className={styles.body} 
            onContextMenu={handleContext}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
        >
            { children }
        </div>
    )
}

export default FileMenu