import React, { useContext, useEffect, useState } from 'react';
import Icon from '@mui/icons-material/InsertDriveFileSharp';
import RemoveIcon from '@mui/icons-material/Remove';
import RenameIcon from '@mui/icons-material/DriveFileRenameOutline';
import CopyIcon from '@mui/icons-material/ContentCopySharp';
import Link from 'next/link';
import { Context } from 'components/contexts/storyContext';
import { openContext } from 'components/contextMenu';
import { FileSystemContext } from './fileSystem';
import FileInput from './fileInput';
import Localization from 'classes/localization';
import styles from 'styles/storyPage/file.module.scss';
import '@types/fileSystem';

/**
 * @param {{ file: StructureFile }}
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

    /**
     * @param {React.MouseEvent<HTMLDivElement, React.MouseEvent>} e 
     */
    const handleContext = (e) => {
        e.preventDefault()
        e.stopPropagation()
        openContext([
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

    useEffect(() => {
        if (!state.inEditMode && state.text !== file.name) {
            dispatch.renameFile(file, state.text, (res) => {
                if (res.success) {
                    file.name = state.text;
                }
                setState({ ...state, inEditMode: false })
            })
        }
    }, [state.inEditMode])

    useEffect(() => {
        setState((state) => ({ ...state, selected: context.fileId === file.id }))
    }, [context.fileId, file.id])

    const className = state.selected 
        ? `${styles.file} ${styles.selected}` 
        : styles.file;

    return (
        <Link href={`/story/${context.story.id}/${file.id}`}>        
            <div 
                className={className} 
                onContextMenu={handleContext}
            >
                <Icon/>  
                { state.inEditMode 
                    ?  <FileInput state={state} setState={setState}/>
                    : `${file.name}.${file.type}`
                }
            </div>
        </Link>
        
    )
}

export default File;