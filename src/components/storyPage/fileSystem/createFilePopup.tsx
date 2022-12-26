import { useMemo, useState } from "react"
import AddIcon from '@mui/icons-material/AddCircleOutlineSharp';
import CloseIcon from '@mui/icons-material/CloseSharp';
import FileIcon from '@mui/icons-material/InsertDriveFileSharp';
import FolderIcon from '@mui/icons-material/FolderSharp';
import UploadIcon from '@mui/icons-material/Upload';
import DropdownMenu from "components/common/dropdownMenu";
import { closePopup } from "components/common/popupHolder";
import Localization from "utils/localization"
import { FileType } from "types/database/files";
import { CreateFileOptions } from "data/fileTemplates";
import styles from 'styles/storyPage/createFilePopup.module.scss'
import { InputType } from "types/context/fileSystemContext";

type FileProps = React.PropsWithRef<{
    type: InputType
    callback: CreateFilePopupCallback
}>

type CreateFileContentProps = React.PropsWithRef<{
    callback: CreateFilePopupCallback
}>

type CreateFolderContentProps = React.PropsWithRef<{
    callback: CreateFilePopupCallback
}>

type CreateUploadContentProps = React.PropsWithRef<{
    callback: CreateFilePopupCallback
}>

interface CreateFilePopupResult {
    type: InputType
    data: CreateFilePopupData
}

interface CreateFilePopupData {
    type: FileType
    name: string
}

type CreateFilePopupCallback = (selected: CreateFilePopupResult) => void

const CreateFilePopup = ({ type, callback }: FileProps): JSX.Element => {
    const [selected, setSelected] = useState<InputType>(type ? type : InputType.File)

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

    const Content = useMemo(() => pageMap[selected]?.content, [selected])

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
                            onClick={() => setSelected(key as InputType)}
                            data={key === selected ? "open" : "closed"}
                            tooltips={pageMap[key].tooltips}
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
const CreateFileContent = ({ callback }: CreateFileContentProps): JSX.Element => {
    const [state, setState] = useState<CreateFilePopupData>({ 
        name: "", type: FileType.Document
    })

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
                    values={CreateFileOptions}
                    onChange={(value) => setState({ ...state, type: value as FileType })}
                />
            </div>
            <div className={styles.inputRow}>
                <div 
                    className={styles.button}
                    onClick={handleClick}
                    disabled={!state.name || !state.type}
                > 
                    {Localization.toText('createFilePopup-button')}
                </div>
            </div>
        </>
    )
}

const CreateFolderContent = ({ callback }: CreateFolderContentProps): JSX.Element => {
    const [state, setState] = useState<CreateFilePopupData>({ 
        name: "", 
        type: FileType.Folder 
    })
    
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
                    onClick={handleClick}
                    disabled={!state.name}
                > 
                    {Localization.toText('createFilePopup-button')}
                </div>
            </div>
        </>
    )
}

const CreateUploadContent = ({ callback }: CreateUploadContentProps): JSX.Element => {
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