import React, { useContext, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import DocumentIcon from '@mui/icons-material/InsertDriveFileSharp';
import RemoveIcon from '@mui/icons-material/Remove';
import RenameIcon from '@mui/icons-material/DriveFileRenameOutline';
import CopyIcon from '@mui/icons-material/ContentCopySharp';
import OpenIcon from '@mui/icons-material/OpenInBrowserSharp';
import OpenInNewPageIcon from '@mui/icons-material/LaunchSharp';
import DuplicateIcon from '@mui/icons-material/DifferenceSharp';
import ConvertIcon from '@mui/icons-material/BuildSharp';
import { FileIcons } from 'assets/icons';
import { Context as StoryContext } from 'components/contexts/storyContext';
import { Context as AppContext } from 'components/contexts/appContext';
import { Context } from 'components/contexts/fileSystemContext';
import { openContext } from 'components/common/contextMenu';
import Navigation from 'utils/navigation';
import Localization from 'utils/localization';
import { asEnum } from 'utils/helpers';
import { CreateFileOptions } from 'data/fileTemplates';
import { FileType, IFileStructure } from "types/database/files";
import { ObjectId } from 'types/database';
import styles from 'styles/pages/storyPage/file.module.scss';

type FileProps = React.PropsWithRef<{
    file: IFileStructure
}>

const File = ({ file }: FileProps): JSX.Element => {
    const [app] = useContext(AppContext);
    const [context] = useContext(StoryContext);
    const [_, dispatch] = useContext(Context);
    const [state, setState] = useState({ inEditMode: false, text: file.name });
    const router = useRouter();
    const ref = useRef<HTMLInputElement>()
    const contextID = file.id + "-context-rename-item"
    const Icon = FileIcons[file.type] ?? DocumentIcon

    const cancelEdit = () => {
        setState({ ...state, inEditMode: false })
    }

    const breakEdit = () => {
        setState({ ...state, text: file.name, inEditMode: false })
    }

    const handleKey = (e: KeyboardEvent) => {
        if (e.code == 'F2' && context.fileId == file.id) {
            setState({ ...state, inEditMode: !state.inEditMode })
        }
    }

    const handleEvent = (e: MouseEvent) => {
        let target = e.target as HTMLInputElement
        if (state.inEditMode && target !== ref.current && target?.id != contextID) {
            cancelEdit()
        }
    }

    const handleDrag = () => {
        window.dragData = { file: file }
    }

    const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        setState({ ...state, text: e.target.value })
    }

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
        if (context.fileId == file.id) {
            window.addEventListener('keydown', handleKey, true)
            return () => {
                window.addEventListener('keydown', handleKey, true)
            }
        }
    }, [context.fileId, file.id])

    const handleContext = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.preventDefault()
        e.stopPropagation()

        const copyIdOption = {
            text: Localization.toText('create-copyId'), 
            icon: CopyIcon, 
            action: () => navigator.clipboard.writeText(file.type === FileType.LocalImage 
                ? `local/${file.id}`
                : String(file.id))
        }
        const deleteOption = { 
            text: Localization.toText('common-delete'), 
            icon: RemoveIcon, 
            action: () => dispatch.openRemoveFileMenu(file)
        }
        const renameOption = { 
            text: Localization.toText('common-rename'), 
            icon: RenameIcon, 
            id: contextID,
            action: () => setState({ ...state, inEditMode: true })
        }
        
        openContext(file.type === FileType.LocalImage 
        ? [
            copyIdOption, renameOption, deleteOption
        ] : [
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
            copyIdOption,
            renameOption,
            deleteOption,
            { 
                text: Localization.toText('create-createCopy'), 
                icon: DuplicateIcon, 
                action: () => dispatch.createCopy(file)
            },
            { 
                text: Localization.toText('create-convert'), 
                icon: ConvertIcon, 
                enabled: file.type === FileType.Document,
                content: Object.keys(CreateFileOptions).filter((type) => type != FileType.Document).map((type) => (
                    {
                        text: CreateFileOptions[type], 
                        icon: FileIcons[type], 
                        action: () => dispatch.convert(file, asEnum(type, FileType))
                    }
                ))
            }
        ], { x: e.pageX, y: e.pageY }, true)
    }

    const className = context.fileId == file.id
        ? `${styles.file} ${styles.selected}`
        : styles.file;

    const Content = (
        <div 
            className={className} 
            onDragStart={handleDrag}
            onContextMenu={handleContext}
            draggable={!state.inEditMode}
            data={app.enableColorFileByType ? file.type : undefined}
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
                    } else if (e.key == 'Escape') {
                        breakEdit()
                    }
                }}
                value={state.text}
            />
        </div>
    )

    return state.inEditMode || file.type === FileType.LocalImage ? Content : (
        <Link 
            href={Navigation.fileURL(file.id)} 
            key={String(file.id)}
            passHref>
            { Content }
        </Link>
    )
}

export default File;