import React, { useContext } from "react";
import FileIcon from '@mui/icons-material/InsertDriveFileSharp';
import FolderIcon from '@mui/icons-material/FolderSharp';
import UploadIcon from '@mui/icons-material/Upload';
import ImportIcon from '@mui/icons-material/DownloadSharp';
import FilterCloseIcon from '@mui/icons-material/FilterAltOffSharp';
import FilterOpenIcon from '@mui/icons-material/FilterAltSharp';
import CollapseIcon from '@mui/icons-material/ChevronLeftSharp';
import { Context } from "components/contexts/fileSystemContext";
import { Context as StoryContext } from "components/contexts/storyContext";
import Searchbox from "components/common/searchbox";
import Localization from "utils/localization";
import { InputType } from "types/context/fileSystemContext";
import styles from 'styles/pages/storyPage/fileSystem.module.scss';

const FileMenuHeader = (): JSX.Element => {
    const [state, dispatch] = useContext(Context)
    const [_, storyDispatch] = useContext(StoryContext)

    const handleSearchChange = (value: string) => {
        dispatch.setSearchFilter(value)
    }

    const handleCollapse = () => {
        storyDispatch.collapseSidePanel();
    }

    const FilterIcon = state.showFilterMenu ? FilterCloseIcon : FilterOpenIcon
    const FilterTooltips = state.showFilterMenu 
        ? Localization.toText('create-filterTooltipsClose') 
        : Localization.toText('create-filterTooltips') 

    return (
        <div className={styles.header}> 
            <div className={styles.headerButtonsRow}>
                <button 
                    className={styles.headerButton}
                    onClick={() => dispatch.openCreateFileMenu(InputType.File)}
                    tooltips={Localization.toText('create-fileTooltips')}> 
                    <FileIcon/> 
                </button>
                <button 
                    className={styles.headerButton}
                    onClick={() => dispatch.openCreateFileMenu(InputType.Folder)}
                    tooltips={Localization.toText('create-folderTooltips')}> 
                    <FolderIcon/> 
                </button>
                {/*
                <div 
                    className={styles.headerButton}
                    onClick={() => dispatch.openCreateFileMenu(InputType.Upload)}
                    tooltips={Localization.toText('create-uploadTooltips')}
                > 
                    <UploadIcon/> 
                </div>
                */}
                <button 
                    className={styles.headerButton}
                    onClick={() => dispatch.openCreateFileMenu(InputType.Import)}
                    tooltips={Localization.toText('create-importTooltips')}> 
                    <ImportIcon/> 
                </button>
                <button
                    className={styles.headerEndButton}
                    onClick={handleCollapse}
                    tooltips={Localization.toText('create-expanderExpandedTooltips')}>
                    <CollapseIcon/>
                </button>
            </div>
            <div className={styles.headerFilterRow}>
                <Searchbox 
                    className={styles.headerSearch} 
                    value={state.searchFilter} 
                    onChange={handleSearchChange}/>
                <button
                    className={styles.headerEndButton}
                    onClick={() => dispatch.setShowFilterMenuState(!state.showFilterMenu)}
                    tooltips={FilterTooltips}>
                    <FilterIcon/>
                </button>
            </div>
        </div>
    )
}

export default FileMenuHeader;