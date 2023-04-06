import { useState } from "react";
import { closePopup } from "components/common/popupHolder";
import roll20Importer from "importers/roll20Importer";
import Localization from "utils/localization";
import { CreateContentProps } from ".";
import { InputType } from "types/context/fileSystemContext";
import styles from 'styles/pages/storyPage/createFilePopup.module.scss';

const CreateImportOldContent = ({ callback }: CreateContentProps): JSX.Element => {
    const [name, setName] = useState("")
    const [value, setValue] = useState("")
    // callback = null
    const handleClick = () => {
        roll20Importer(value)
        .then((res) => res && callback && callback({
            type: InputType.Import,
            data: {
                type: res.type,
                name: name,
                data: res.metadata
            }
        }))
        .catch(console.error)
        closePopup()
    }

    return (
        <>
            <div className={styles.inputRow}>
                <span>{Localization.toText('createFilePopup-fileNamePrompt')}:</span>
                <input 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    placeholder={Localization.toText('createFilePopup-fileNamePlaceholder')}
                />
            </div>
            <div className={styles.inputRow}>
                <span>{Localization.toText('createFilePopup-importURLPrompt')}:</span>
                <input 
                    value={value} 
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={Localization.toText('createFilePopup-importURLPlaceholder')}
                />
            </div>
            <div className={styles.inputRow}/>
            <div className={styles.inputRow}>
                <button 
                    onClick={handleClick}
                    disabled={!value || !name}> 
                    {Localization.toText('createFilePopup-button-import')}
                </button>
            </div>
        </>
    )
}

export default CreateImportOldContent;