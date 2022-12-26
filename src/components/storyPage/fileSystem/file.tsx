import React, { useContext, useEffect, useMemo, useState } from 'react';
import DocumentIcon from '@mui/icons-material/InsertDriveFileSharp';
import RemoveIcon from '@mui/icons-material/Remove';
import RenameIcon from '@mui/icons-material/DriveFileRenameOutline';
import CopyIcon from '@mui/icons-material/ContentCopySharp';
import OpenIcon from '@mui/icons-material/OpenInBrowserSharp';
import OpenInNewPageIcon from '@mui/icons-material/LaunchSharp';
import CharacterIcon from '@mui/icons-material/PersonSharp';
import SpellIcon from '@mui/icons-material/AutoAwesomeSharp';
import { DragonIcon, HandIcon } from 'assets/icons';
import { Context as StoryContext } from 'components/contexts/storyContext';
import { Context } from 'components/contexts/fileSystemContext';
import { openContext } from 'components/common/contextMenu';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Navigation from 'utils/navigation';
import Localization from 'utils/localization';
import FileInput from './fileInput';
import { FileStructure, FileType } from "types/database/files";
import styles from 'styles/storyPage/file.module.scss';

type FileProps = React.PropsWithRef<{
    file: FileStructure
}>

const File = ({ file }: FileProps): JSX.Element => {
    const [context] = useContext(StoryContext);
    const [_, dispatch] = useContext(Context);
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
            case FileType.Character:
                return CharacterIcon
            case FileType.Spell:
                return SpellIcon
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

    const handleContext = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.preventDefault()
        e.stopPropagation()
        openContext([
            {
                text: Localization.toText('create-openFile'), 
                icon: OpenIcon, 
                action: () => router.push(Navigation.fileURL(file.id))
            },
            {
                text: Localization.toText('create-openFileNewTab'), 
                icon: OpenInNewPageIcon, 
                action: () => window.open(Navigation.fileURL(file.id))
            },
            {
                text: Localization.toText('create-copyId'), 
                icon: CopyIcon, 
                action: () => navigator.clipboard.writeText(String(file.id))
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

    const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
        window.dragData = { file: file }
    }

    const className = state.selected 
        ? `${styles.file} ${styles.selected}` 
        : styles.file;

    return (
        <Link href={Navigation.fileURL(file.id)} passHref>        
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