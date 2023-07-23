import React, { useContext } from "react";
import ExpandIcon from '@mui/icons-material/ChevronRightSharp';
import FileSystemContext from "components/contexts/fileSystemContext";
import { Context } from "components/contexts/storyContext";
import FileMenuHeader from "./fileMenuHeader";
import FileMenu from "./fileMenu";
import styles from 'styles/pages/storyPage/fileSystem.module.scss';
import Localization from "utils/localization";

const FileSystem = (): JSX.Element => {
    return (
        <div className={styles.main}>
            <FileSystemContext>
                <FileMenuHeader/>
                <FileMenu/>
            </FileSystemContext>
        </div>
    )
}

export const FileSystemCollapsedBody = (): JSX.Element => {
    const [_, dispatch] = useContext(Context)

    const handleExpand = () => {
        dispatch.expandSidePanel();
    }

    return (
        <div className={styles.collapsedMenu}>
            <button
                className={styles.collapsedButton}
                onClick={handleExpand}
                tooltips={Localization.toText('create-expanderCollapsedTooltipsClose') }>
                <ExpandIcon/>
            </button>
        </div>
    )
}

export default FileSystem;