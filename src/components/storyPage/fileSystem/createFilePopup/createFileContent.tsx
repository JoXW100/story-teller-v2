import { useState } from "react";
import DropdownMenu from "components/common/dropdownMenu";
import { closePopup } from "components/common/popupHolder";
import Localization from "utils/localization"
import { FileType } from "types/database/files";
import { CreateFileOptions } from "data/fileTemplates";
import { CreateContentProps, CreateFilePopupData } from ".";
import { InputType } from "types/context/fileSystemContext";
import styles from 'styles/storyPage/createFilePopup.module.scss';

const CreateFileContent = ({ callback }: CreateContentProps): JSX.Element => {
    const [state, setState] = useState<CreateFilePopupData>({ 
        name: "", type: FileType.Document
    })

    const handleClick = () => {
        callback({ type: InputType.File, data: state })
        closePopup()
    }

    return (
        <>
            <div className={styles.inputRow}>
                <div>{Localization.toText('createFilePopup-fileNamePrompt')}:</div>
                <input 
                    value={state.name} 
                    onChange={(e) => setState({ ...state, name: e.target.value})}
                    placeholder={Localization.toText('createFilePopup-fileNamePlaceholder')}
                />
            </div>
            <div className={styles.inputRow}>
                <div>{Localization.toText('createFilePopup-typePrompt')}:</div>
                <DropdownMenu 
                    className={styles.dropdown}
                    value={state.type} 
                    values={CreateFileOptions}
                    onChange={(value) => setState({ ...state, type: value as FileType })}
                />
            </div>
            <div className={styles.inputRow}/>
            <div className={styles.inputRow}>
                <div 
                    className={styles.button}
                    onClick={handleClick}
                    disabled={!state.name || !state.type}
                > 
                    {Localization.toText('createFilePopup-button')}
                </div>
            </div>
        </>
    )
}

export default CreateFileContent;