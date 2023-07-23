import { useContext } from "react";
import CloseIcon from '@mui/icons-material/CloseSharp';
import FolderIcon from '@mui/icons-material/FolderSharp';
import Checkbox from "components/common/checkbox";
import { Context } from "components/contexts/fileSystemContext";
import { FileIcons } from "assets/icons";
import { CreateFileOptions } from "data/fileTemplates";
import Localization from "utils/localization";
import { FileType } from "types/database/files";
import styles from 'styles/pages/storyPage/fileSystem.module.scss';

const FileFilterMenu = (): JSX.Element => {
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
            <div className={styles.fileFilterMenuItem}>
                <Checkbox 
                    value={state.fileFilter.showEmptyFolders} 
                    onChange={handleChangeFolder}/>
                <FolderIcon/>
                {Localization.toText('filter-menu-showEmptyFolders') }
            </div>
            { Object.keys(CreateFileOptions).map((type) => {
                const Icon = FileIcons[type] ?? FileIcons[FileType.Document]
                return (
                    <div className={styles.fileFilterMenuItem} key={type}>
                        <Checkbox 
                            value={state.fileFilter[type]} 
                            onChange={() => handleChange(type as FileType)}/>
                        <Icon/>
                        { CreateFileOptions[type] }
                    </div>
                )
            })}
        </div>
    )
}

export default FileFilterMenu