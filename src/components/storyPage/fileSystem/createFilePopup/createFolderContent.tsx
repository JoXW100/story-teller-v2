import { useRef, useState } from "react";
import { closePopup } from "components/common/popupHolder";
import Localization from "utils/localization";
import { FileType } from "types/database/files";
import { CreateContentProps } from ".";
import { InputType } from "types/context/fileSystemContext";
import styles from 'styles/pages/storyPage/createFilePopup.module.scss';

const CreateFolderContent = ({ callback }: CreateContentProps): JSX.Element => {
    const ref = useRef<HTMLButtonElement>(null);
    const [value, setValue] = useState("")
    
    const handleClick = () => {
        callback({ type: InputType.Folder, data: { name: value, type: FileType.Folder } })
        closePopup()
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value)
    }

    const handleInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !ref.current.disabled){
            ref.current.click();
            closePopup()
            closePopup()
        }
    }

    return (
        <>
            <div className={styles.inputRow}>
                <span>{Localization.toText('createFilePopup-folderNamePrompt')}:</span>
                <input 
                    value={value} 
                    onChange={handleChange}
                    onKeyDown={handleInput}
                    placeholder={Localization.toText('createFilePopup-folderNamePlaceholder')}
                />
            </div>
            <div className={styles.inputRowLast}>
                <button 
                    ref={ref}
                    onClick={handleClick}
                    disabled={!value}> 
                    {Localization.toText('createFilePopup-button')}
                </button>
            </div>
        </>
    )
}

export default CreateFolderContent;