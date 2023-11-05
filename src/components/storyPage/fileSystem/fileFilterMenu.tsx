import { useContext } from "react";
import CloseIcon from '@mui/icons-material/CloseSharp';
import FolderIcon from '@mui/icons-material/FolderSharp';
import Checkbox from "components/common/checkbox";
import { Context } from "components/contexts/fileSystemContext";
import { Context as AppContext } from "components/contexts/appContext";
import { FileIcons } from "assets/icons";
import { CreateFileOptions } from "data/fileTemplates";
import Localization from "utils/localization";
import { FileType } from "types/database/files";
import styles from 'styles/pages/storyPage/fileSystem.module.scss';
import { asEnum } from "utils/helpers";

const FileFilterMenu = (): JSX.Element => {
    const [app] = useContext(AppContext)
    const [state, dispatch] = useContext(Context)
    const handleChangeFolder = () => {
        dispatch.setFileFilter({
            ...state.fileFilter,
            showEmptyFolders: !state.fileFilter.showEmptyFolders
        })
    }
    const handleChange = (type: FileType) => {
        dispatch.setFileFilter({
            ...state.fileFilter,
            [type]: !state.fileFilter[type]
        })
    }

    return (
        <div className={styles.fileFilterMenu}>
            <div className={styles.fileFilterMenuHeader}>
                { Localization.toText("filter-menu-header")}
                <button 
                    className={styles.headerEndButton}
                    onClick={() => dispatch.setShowFilterMenuState(false)}
                    tooltips={Localization.toText('filter-menu-closeTooltips')}> 
                    <CloseIcon/> 
                </button>
            </div>
            <div className={styles.fileFilterMenuItem} data={app.enableColorFileByType ? FileType.Folder : undefined}>
                <Checkbox 
                    value={state.fileFilter.showEmptyFolders} 
                    onChange={handleChangeFolder}/>
                <FolderIcon/>
                {Localization.toText('filter-menu-showEmptyFolders') }
            </div>
            { Object.keys(CreateFileOptions).map((type) => {
                const Icon = FileIcons[type] ?? FileIcons[FileType.Document]
                return (
                    <div 
                        className={styles.fileFilterMenuItem} 
                        key={type} 
                        data={app.enableColorFileByType ? type : undefined}>
                        <Checkbox 
                            value={state.fileFilter[type]} 
                            onChange={() => handleChange(asEnum(type, FileType))}/>
                        <Icon/>
                        { CreateFileOptions[type] }
                    </div>
                )
            })}
        </div>
    )
}

export default FileFilterMenu