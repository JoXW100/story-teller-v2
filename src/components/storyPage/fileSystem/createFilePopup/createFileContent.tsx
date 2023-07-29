import { useRef, useState } from "react";
import DropdownMenu from "components/common/dropdownMenu";
import { closePopup } from "components/common/popupHolder";
import Localization from "utils/localization"
import { FileType } from "types/database/files";
import { CreateFileOptions } from "data/fileTemplates";
import { CreateContentProps, CreateFilePopupData } from ".";
import { InputType } from "types/context/fileSystemContext";
import styles from 'styles/pages/storyPage/createFilePopup.module.scss';

const CreateFileContent = ({ callback }: CreateContentProps): JSX.Element => {
    const ref = useRef<HTMLButtonElement>(null);
    const [state, setState] = useState<CreateFilePopupData>({ 
        name: "", type: FileType.Document
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setState({ ...state, name: e.target.value})
    }

    const handleInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !ref.current.disabled){
            ref.current.click();
            closePopup()
            closePopup()
        }
    }
    
    const handleClick = () => {
        callback({ type: InputType.File, data: state })
        closePopup()
    }

    return (
        <>
            <div className={styles.inputRow}>
                <span>{Localization.toText('createFilePopup-fileNamePrompt')}:</span>
                <input 
                    value={state.name} 
                    onChange={handleChange}
                    onKeyDown={handleInput}
                    placeholder={Localization.toText('createFilePopup-fileNamePlaceholder')}/>
            </div>
            <div className={styles.inputRow}>
                <span>{Localization.toText('createFilePopup-typePrompt')}:</span>
                <DropdownMenu 
                    className={styles.dropdown}
                    itemClassName={styles.dropdownItem}
                    value={state.type} 
                    values={CreateFileOptions}
                    onChange={(value) => setState({ ...state, type: value as FileType })}/>
            </div>
            <div className={styles.inputRowLast}>
                <button 
                    ref={ref}
                    onClick={handleClick}
                    disabled={!state.name || !state.type}> 
                    {Localization.toText('createFilePopup-button')}
                </button>
            </div>
        </>
    )
}

export default CreateFileContent;