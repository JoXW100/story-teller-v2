import { useMemo, useState } from "react"
import AddIcon from '@mui/icons-material/AddCircleOutlineSharp';
import CloseIcon from '@mui/icons-material/CloseSharp';
import FileIcon from '@mui/icons-material/InsertDriveFileSharp';
import FolderIcon from '@mui/icons-material/FolderSharp';
import UploadIcon from '@mui/icons-material/Upload';
import DropdownMenu from "components/dropdownMenu";
import Localization from "classes/localization"
import { closePopup } from "components/popupHolder";
import { FileType } from "@types/database";
import { InputType } from '@types/storyPage';
import styles from 'styles/storyPage/createFilePopup.module.scss'

/**
 * @param {{ type: InputType, callback: import('@types/storyPage').CreateFileCallback }}
 */
const CreateFilePopup = ({ type, callback }) => {
    const [state, setState] = useState({ type: type ? type : InputType.File })

    const pageMap = {
        [InputType.File]: {
            icon: <FileIcon/>,
            tooltips: Localization.toText('create-fileTooltips'),
            content: CreateFileContent
        },
        [InputType.Folder]: {
            icon: <FolderIcon/>,
            tooltips: Localization.toText('create-folderTooltips'),
            content: CreateFolderContent
        },
        [InputType.Upload]: {
            icon: <UploadIcon/>,
            tooltips: Localization.toText('create-uploadTooltips'),
            content: CreateUploadContent
        }
    }

    const Content = useMemo(() => pageMap[state.type]?.content, [state.type])

    return (
        <div className={styles.main}>
            <div className={styles.header}>
                <AddIcon/>
                { Localization.toText('createFilePopup-header')}
                <div 
                    className={styles.button} 
                    onClick={() => closePopup()}
                    tooltips={Localization.toText("createFilePopup-closeTooltips")}
                > 
                    <CloseIcon/>
                </div>
            </div>
            <div className={styles.body}>
                <div className={styles.navigation}>
                    { Object.keys(pageMap).map((key, index) => (
                        <div 
                            key={index} 
                            className={styles.icon}
                            tooltips={pageMap[key].tooltips}
                            onClick={() => setState({ ...state, type: key })}
                            open={key === state.type}
                        > 
                            { pageMap[key].icon }
                        </div>
                    ))}
                </div>
                <div className={styles.content}>
                    { Content && <Content callback={callback}/>}
                </div>
            </div>
        </div>
    )
}

/**
 * @param {{ callback: import('@types/storyPage').CreateFileCallback }} 
 * @returns {JSX.Element}
 */
const CreateFileContent = ({ callback }) => {
    const [state, setState] = useState({ name: "", type: FileType.Document })

    const handleClick = () => {
        callback({ type: InputType.File, data: state })
        closePopup()
    }

    return (
        <>
            <div className={styles.inputRow}>
                <div>{Localization.toText('createFilePopup-fileNamePrompt')}:</div>
                <input 
                    value={state.name} 
                    onChange={(e) => setState({ ...state, name: e.target.value})}
                    placeholder={Localization.toText('createFilePopup-fileNamePlaceholder')}
                />
            </div>
            <div className={styles.inputRow}>
                <div>{Localization.toText('createFilePopup-typePrompt')}:</div>
                <DropdownMenu 
                    className={styles.dropdown}
                    value={state.type} 
                    values={{ [FileType.Document]: 'Document' }}
                    onChange={(value) => setState({ ...state, type: value })}
                />
            </div>
            <div className={styles.inputRow}>
                <div 
                    className={styles.button}
                    disabled={!state.name || !state.type}
                    onClick={handleClick}
                > 
                    {Localization.toText('createFilePopup-button')}
                </div>
            </div>
        </>
    )
}

/**
 * @param {{ callback: import('@types/storyPage').CreateFileCallback }} 
 * @returns {JSX.Element}
 */
const CreateFolderContent = ({ callback }) => {
    const [state, setState] = useState({ name: "", type: FileType.Folder })
    
    const handleClick = () => {
        callback({ type: InputType.Folder, data: state })
        closePopup()
    }

    return (
        <>
            <div className={styles.inputRow}>
                <div>{Localization.toText('createFilePopup-folderNamePrompt')}:</div>
                <input 
                    value={state.name} 
                    onChange={(e) => setState({ ...state, name: e.target.value})}
                    placeholder={Localization.toText('createFilePopup-folderNamePlaceholder')}
                />
            </div>
            <div className={styles.inputRow}/>
            <div className={styles.inputRow}>
                <div 
                    className={styles.button}
                    disabled={!state.name}
                    onClick={handleClick}
                > 
                    {Localization.toText('createFilePopup-button')}
                </div>
            </div>
        </>
    )
}

/**
 * @param {{ callback: import('@types/storyPage').CreateFileCallback }} 
 * @returns {JSX.Element}
 */
const CreateUploadContent = ({ callback }) => {
    const [state, setState] = useState({ file: null })

    const handleFileUpload = () => {
        closePopup()
    }

    return (
        <>
            <div className={styles.inputArea}>
                <div className={styles.upload}>
                    <input type="file" onChange={handleFileUpload}/>
                    <UploadIcon/>
                    <div>Click or drag to upload file</div>
                </div>
            </div>
        </>
    )
}

export default CreateFilePopup;