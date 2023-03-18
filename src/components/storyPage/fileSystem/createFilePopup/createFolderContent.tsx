import { useState } from "react";
import { closePopup } from "components/common/popupHolder";
import Localization from "utils/localization";
import { FileType } from "types/database/files";
import { CreateContentProps } from ".";
import { InputType } from "types/context/fileSystemContext";
import styles from 'styles/storyPage/createFilePopup.module.scss';

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

export default CreateFolderContent;