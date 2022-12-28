import { useMemo, useState } from "react"
import AddIcon from '@mui/icons-material/AddCircleOutlineSharp';
import CloseIcon from '@mui/icons-material/CloseSharp';
import FileIcon from '@mui/icons-material/InsertDriveFileSharp';
import FolderIcon from '@mui/icons-material/FolderSharp';
import UploadIcon from '@mui/icons-material/Upload';
import ImportIcon from '@mui/icons-material/DownloadSharp';
import DropdownMenu from "components/common/dropdownMenu";
import { closePopup } from "components/common/popupHolder";
import Localization from "utils/localization"
import { FileMetadata, FileType } from "types/database/files";
import { CreateFileOptions } from "data/fileTemplates";
import roll20Importer from "importers/roll20Importer";
import { InputType } from "types/context/fileSystemContext";
import styles from 'styles/storyPage/createFilePopup.module.scss'

type FileProps = React.PropsWithRef<{
    type: InputType
    callback: CreateFilePopupCallback
}>

type CreateContentProps = React.PropsWithRef<{
    callback: CreateFilePopupCallback
}>

interface CreateFilePopupResult {
    type: InputType
    data: CreateFilePopupData
}

interface CreateFilePopupData {
    type: FileType
    name: string
    data?: FileMetadata
}

type CreateFilePopupCallback = (selected: CreateFilePopupResult) => void

const CreateFilePopup = ({ type, callback }: FileProps): JSX.Element => {
    const [selected, setSelected] = useState<InputType>(type ? type : InputType.File)

    const pageMap = {
        [InputType.File]: {
            icon: FileIcon,
            tooltips: 'create-fileTooltips',
            content: CreateFileContent
        },
        [InputType.Folder]: {
            icon: FolderIcon,
            tooltips: 'create-folderTooltips',
            content: CreateFolderContent
        },
        /**
        [InputType.Upload]: {
            icon: UploadIcon,
            tooltips: 'create-uploadTooltips',
            content: CreateUploadContent
        },
         */
        [InputType.Import]: {
            icon: ImportIcon,
            tooltips: 'create-importTooltips',
            content: CreateImportContent
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
                    { Object.keys(pageMap).map((key, index) => {
                        var page = pageMap[key]
                        return (
                            <div 
                                key={index} 
                                className={styles.icon}
                                onClick={() => setSelected(key as InputType)}
                                data={key === selected ? "open" : "closed"}
                                tooltips={Localization.toText(page.tooltips)}
                            > 
                                <page.icon/>
                            </div>
                        )
                    })}
                </div>
                <div className={styles.content}>
                    { Content && <Content callback={callback}/>}
                </div>
            </div>
        </div>
    )
}
const CreateFileContent = ({ callback }: CreateContentProps): JSX.Element => {
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

const CreateFolderContent = ({ callback }: CreateContentProps): JSX.Element => {
    const [value, setValue] = useState("")
    
    const handleClick = () => {
        callback({ type: InputType.Folder, data: { name: value, type: FileType.Folder } })
        closePopup()
    }

    return (
        <>
            <div className={styles.inputRow}>
                <div>{Localization.toText('createFilePopup-folderNamePrompt')}:</div>
                <input 
                    value={value} 
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={Localization.toText('createFilePopup-folderNamePlaceholder')}
                />
            </div>
            <div className={styles.inputRow}/>
            <div className={styles.inputRow}>
                <div 
                    className={styles.button}
                    onClick={handleClick}
                    disabled={!value}
                > 
                    {Localization.toText('createFilePopup-button')}
                </div>
            </div>
        </>
    )
}

const CreateUploadContent = ({ callback }: CreateContentProps): JSX.Element => {
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

const CreateImportContent = ({ callback }: CreateContentProps): JSX.Element => {
    const [name, setName] = useState("")
    const [value, setValue] = useState("")
    // callback = null
    const handleClick = () => {
        roll20Importer(value)
        .then((res) => res && callback && callback({
            type: InputType.Import,
            data: {
                type: res.type,
                name: name,
                data: res.metadata
            }
        }))
        .catch(console.error)
        closePopup()
    }

    return (
        <>
            <div className={styles.inputRow}>
                <div>{Localization.toText('createFilePopup-fileNamePrompt')}:</div>
                <input 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    placeholder={Localization.toText('createFilePopup-fileNamePlaceholder')}
                />
            </div>
            <div className={styles.inputRow}>
                <div>{Localization.toText('createFilePopup-importURLPrompt')}:</div>
                <input 
                    value={value} 
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={Localization.toText('createFilePopup-importURLPlaceholder')}
                />
            </div>
            <div className={styles.inputRow}>
                <div 
                    className={styles.button}
                    onClick={handleClick}
                    disabled={!value || !name}
                > 
                    {Localization.toText('createFilePopup-button-import')}
                </div>
            </div>
        </>
    )
}

export default CreateFilePopup;