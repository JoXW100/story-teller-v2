import React from "react";
import FileSystemContext from "components/contexts/fileSystemContext";
import FileMenuHeader from "./fileMenuHeader";
import FileMenu from "./fileMenu";
import styles from 'styles/storyPage/fileSystem.module.scss';

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

export default FileSystem;