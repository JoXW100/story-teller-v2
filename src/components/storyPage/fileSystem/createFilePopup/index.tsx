import { useMemo, useState } from "react"
import AddIcon from '@mui/icons-material/AddCircleOutlineSharp';
import CloseIcon from '@mui/icons-material/CloseSharp';
import FileIcon from '@mui/icons-material/InsertDriveFileSharp';
import FolderIcon from '@mui/icons-material/FolderSharp';
import ImportIcon from '@mui/icons-material/DownloadSharp';
import UploadIcon from '@mui/icons-material/Upload';
import ErrorIcon from '@mui/icons-material/ErrorSharp';
import { closePopup } from "components/common/popupHolder";
import CreateFileContent from "./createFileContent";
import CreateFolderContent from "./createFolderContent";
import CreateImportContent from "./createImportContent";
import CreateImportOldContent from "./createImportOldContent";
import CreateUploadContent from "./createUploadContent";
import Localization from "utils/localization";
import { IFileMetadata, FileType, ILocalFile } from "types/database/files";
import { InputType } from "types/context/fileSystemContext";
import styles from 'styles/pages/storyPage/createFilePopup.module.scss';

type FileProps = React.PropsWithRef<{
    type: InputType
    callback: CreateFilePopupCallback
}>

export type CreateContentProps = React.PropsWithRef<{
    callback: CreateFilePopupCallback
}>

export interface CreateFilePopupResult {
    type: InputType
    data?: CreateFilePopupData
    resources?: Record<string, ILocalFile>
}

export interface CreateFilePopupData {
    type: FileType
    name: string
    data?: IFileMetadata
    file?: string | ArrayBuffer
}

interface PageData {
    icon: React.FunctionComponent<React.SVGAttributes<SVGElement>>,
    tooltips: string,
    width: number,
    content: (props: CreateContentProps) => JSX.Element
}

type CreateFilePopupCallback = (selected: CreateFilePopupResult) => void

const CreateFilePopup = ({ type, callback }: FileProps): JSX.Element => {
    const [selected, setSelected] = useState<InputType>(type ? type : InputType.File)

    const pageMap = {
        [InputType.File]: {
            icon: FileIcon,
            tooltips: 'create-fileTooltips',
            width: 600,
            content: CreateFileContent
        },
        [InputType.Folder]: {
            icon: FolderIcon,
            tooltips: 'create-folderTooltips',
            width: 600,
            content: CreateFolderContent
        },
        [InputType.Import]: {
            icon: ImportIcon,
            tooltips: 'create-importTooltips',
            width: 1200,
            content: CreateImportContent
        },
        [InputType.ImportOld]: {
            icon: ErrorIcon,
            tooltips: 'create-importOldTooltips',
            width: 600,
            content: CreateImportOldContent
        },
        [InputType.Upload]: {
            icon: UploadIcon,
            width: 600,
            tooltips: 'create-uploadTooltips',
            content: CreateUploadContent
        }
    } satisfies Partial<Record<InputType, PageData>>
    
    document.documentElement.style.setProperty(`--popup-width`, `${pageMap[selected]?.width ?? 600}px`);
    const Content = useMemo(() => pageMap[selected]?.content, [selected])
    
    return (
        <div className={styles.main}>
            <div className={styles.header}>
                <AddIcon/>
                { Localization.toText('createFilePopup-header')}
                <button 
                    onClick={() => closePopup()}
                    tooltips={Localization.toText("createFilePopup-closeTooltips")}> 
                    <CloseIcon/>
                </button>
            </div>
            <div className={styles.body}>
                <div className={styles.navigation}>
                    { Object.keys(pageMap).map((key, index) => {
                        let page = pageMap[key]
                        return (
                            <div 
                                key={index} 
                                className={styles.icon}
                                onClick={() => setSelected(key as InputType)}
                                data={key === selected ? "open" : "closed"}
                                tooltips={Localization.toText(page.tooltips)}
                                disabled={type === InputType.Upload || key === InputType.Upload}
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

export default CreateFilePopup;