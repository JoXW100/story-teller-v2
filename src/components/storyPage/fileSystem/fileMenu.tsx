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
import { IFileStructure, FileType, ILocalFile } from "types/database/files";
import styles from 'styles/pages/storyPage/fileSystem.module.scss';

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
            
            let file = window.dragData?.file;
            if (file && (file.holderId !== storyContext.story.root)) {
                dispatch.moveFile(file, null)
            }

            window.dragData.target = null;
            window.dragData.file = null;
        }
    }

    const buildFileStructure = (file: IFileStructure): JSX.Element => {
        if (file.type === FileType.Folder || file.type === FileType.LocalFolder) {
            return (
                <Folder key={String(file.id)} file={file}>
                    { file.children?.map(buildFileStructure) }
                </Folder>
            )
        } else {
            return (
                <File key={String(file.id)} file={file}/>
            )
        }
    }

    const matchSearch = (file: IFileStructure): boolean => {
        return file.name.toLowerCase().includes(context.searchFilter.toLowerCase())
    }

    const filterFileStructure = (structure: IFileStructure[]): IFileStructure[] => {
        let { files, folders } = structure.reduce<{ files: IFileStructure[], folders: IFileStructure[]}>((prev, val) => {
            if (val.type === FileType.Folder) {
                // Don't modify the structure children directly
                let folder = { ...val, children: filterFileStructure(val.children ?? []) } satisfies IFileStructure
                if (!context.fileFilter.showEmptyFolders && folder.children.length == 0) {
                    return prev
                }
                if (matchSearch(folder) || folder.children.length > 0) {
                    return { ...prev, folders: [...prev.folders, folder] }
                }
            } else if (context.fileFilter[val.type] && matchSearch(val)) {
                return { ...prev, files: [...prev.files, val] }
            }
            return prev
        }, { files: [], folders: []})

        return [
            ...folders.sort((a,b) => a.name.localeCompare(b.name)), 
            ...files.sort((a,b) => a.name.localeCompare(b.name))
        ]
    }

    const convertLocalFileStructure = (files: Record<string, ILocalFile>): IFileStructure[] => {
        let roots: string[] = []
        let rootMap: Record<string, string[]> = {}

        for (const id in files) {
            const file = files[id]
            if (!file.holderId) {
                roots.push(file.id)
            } else {
                rootMap[file.holderId] = [...rootMap[file.holderId] ?? [], file.id]
            }
        }

        const resolveMaps = (id: string): IFileStructure => {
            let file = files[id]
            return { 
                id: file.id,
                holderId: file.holderId,
                type: file.type,
                name: file.name,
                open: file.open ?? false,
                children: rootMap[file.id]?.map(resolveMaps) ?? []
            }
        }
        return roots.map(resolveMaps)
    }


    const children = useMemo<JSX.Element[]>(() => {
        let localFolder: IFileStructure = {
            type: FileType.LocalFolder,
            holderId: null,
            id: null,
            name: "local",
            open: false,
            children: filterFileStructure(convertLocalFileStructure(storyContext.localFiles))
        }
        return Object.keys(storyContext.localFiles).length > 0 ? [
            buildFileStructure(localFolder),
            ...filterFileStructure(context.files).map(buildFileStructure)
        ] : filterFileStructure(context.files).map(buildFileStructure)
    }, [context.files, context.fileFilter, context.searchFilter, storyContext.localFiles]);
    
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