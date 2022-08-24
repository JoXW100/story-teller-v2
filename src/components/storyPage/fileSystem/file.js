import React, { useContext, useEffect, useMemo, useState } from 'react';
import DocumentIcon from '@mui/icons-material/InsertDriveFileSharp';
import RemoveIcon from '@mui/icons-material/Remove';
import RenameIcon from '@mui/icons-material/DriveFileRenameOutline';
import CopyIcon from '@mui/icons-material/ContentCopySharp';
import OpenIcon from '@mui/icons-material/OpenInBrowserSharp';
import OpenInNewPageIcon from '@mui/icons-material/LaunchSharp';
import { DragonIcon, HandIcon } from 'assets/icons';
import { Context } from 'components/contexts/storyContext';
import { openContext } from 'components/contextMenu';
import { FileSystemContext } from './fileSystem';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Navigation from 'utils/navigation';
import Localization from 'classes/localization';
import FileInput from './fileInput';
import { FileType } from '@enums/database';
import styles from 'styles/storyPage/file.module.scss';
import '@types/fileSystem';

/**
 * @param {{ file: import('@types/database').StructureFile }}
 * @returns {JSX.Element}
 */
const File = ({ file }) => {
    const [context] = useContext(Context);
    const [_, dispatch] = useContext(FileSystemContext);
    const [state, setState] = useState({ 
        inEditMode: false, 
        selected: context.fileId === file.id, 
        text: file.name
    });
    const router = useRouter();

    const Icon = useMemo(() => {
        switch (file.type) {
            case FileType.Creature:
                return DragonIcon;
            case FileType.Ability:
                return HandIcon;
            default: 
                return DocumentIcon
        }
    }, [file.type])

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
        setState((state) => ({ ...state, selected: context.fileId === file.id }))
    }, [context.fileId, file.id])

    /** @param {React.MouseEvent<HTMLDivElement, React.MouseEvent>} e */
    const handleContext = (e) => {
        e.preventDefault()
        e.stopPropagation()
        openContext([
            {
                text: Localization.toText('create-openFile'), 
                icon: OpenIcon, 
                action: () => router.push(Navigation.FileURL(file.id))
            },
            {
                text: Localization.toText('create-openFileNewTab'), 
                icon: OpenInNewPageIcon, 
                action: () => window.open(Navigation.FileURL(file.id))
            },
            {
                text: Localization.toText('create-copyId'), 
                icon: CopyIcon, 
                action: () => navigator.clipboard.writeText(file.id)
            },
            { 
                text: Localization.toText('create-rename'), 
                icon: RenameIcon, 
                action: () => setState({ ...state, inEditMode: true })
            },
            { 
                text: Localization.toText('create-delete'), 
                icon: RemoveIcon, 
                action: () => dispatch.openRemoveFileMenu(file)
            }
        ], { x: e.pageX, y: e.pageY }, true)
    }

    /** @param {React.DragEvent<HTMLDivElement> e} */
    const handleDrag = (e) => {
        window.dragData = { file: file }
    }

    const className = state.selected 
        ? `${styles.file} ${styles.selected}` 
        : styles.file;

    return (
        <Link href={Navigation.FileURL(file.id)}>        
            <div 
                className={className} 
                onDragStart={handleDrag}
                onContextMenu={handleContext}
                draggable
            >
                <Icon/>  
                { state.inEditMode 
                    ?  <FileInput state={state} setState={setState}/>
                    : <div className={styles.text}> {`${file.name}.${file.type}`} </div>
                }
            </div>
        </Link>
        
    )
}

export default File;