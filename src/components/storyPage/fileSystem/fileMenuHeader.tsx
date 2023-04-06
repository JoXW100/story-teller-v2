import React, { useContext, useMemo } from "react";
import FileIcon from '@mui/icons-material/InsertDriveFileSharp';
import FolderIcon from '@mui/icons-material/FolderSharp';
import UploadIcon from '@mui/icons-material/Upload';
import ImportIcon from '@mui/icons-material/DownloadSharp';
import FilterCloseIcon from '@mui/icons-material/FilterAltOffSharp';
import FilterOpenIcon from '@mui/icons-material/FilterAltSharp';
import { Context } from "components/contexts/fileSystemContext";
import Searchbox from "components/common/searchbox";
import Localization from "utils/localization";
import { InputType } from "types/context/fileSystemContext";
import styles from 'styles/pages/storyPage/fileSystem.module.scss';

const FileMenuHeader = (): JSX.Element => {
    const [state, dispatch] = useContext(Context)
    const handleSearchChange = (value: string) => {
        dispatch.setSearchFilter(value)
    }

    const FilterIcon = state.showFilterMenu 
        ? FilterCloseIcon 
        : FilterOpenIcon

    return (
        <div className={styles.header}> 
            <div className={styles.headerContent}>
                <button 
                    onClick={() => dispatch.openCreateFileMenu(InputType.File)}
                    tooltips={Localization.toText('create-fileTooltips')}> 
                    <FileIcon/> 
                </button>
                <button 
                    onClick={() => dispatch.openCreateFileMenu(InputType.Folder)}
                    tooltips={Localization.toText('create-folderTooltips')}> 
                    <FolderIcon/> 
                </button>
                {/*
                <div 
                    className={styles.upload}
                    onClick={() => dispatch.openCreateFileMenu(InputType.Upload)}
                    tooltips={Localization.toText('create-uploadTooltips')}
                > 
                    <UploadIcon/> 
                </div>
                */}
                <button 
                    onClick={() => dispatch.openCreateFileMenu(InputType.Import)}
                    tooltips={Localization.toText('create-importTooltips')}> 
                    <ImportIcon/> 
                </button>

                <button
                    className={styles.headerFilterButton}
                    onClick={() => dispatch.setShowFilterMenuState(!state.showFilterMenu)}
                    tooltips={Localization.toText('create-filterTooltips')}>
                    <FilterIcon/>
                </button>
            </div>
            <Searchbox 
                className={styles.headerSearch} 
                value={state.searchFilter} 
                onChange={handleSearchChange}/>
        </div>
    )
}

export default FileMenuHeader;