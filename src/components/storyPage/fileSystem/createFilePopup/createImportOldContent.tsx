import { useRef, useState } from "react";
import { closePopup } from "components/common/popupHolder";
import roll20Importer from "importers/roll20Importer";
import Localization from "utils/localization";
import { CreateContentProps } from ".";
import { InputType } from "types/context/fileSystemContext";
import styles from 'styles/pages/storyPage/createFilePopup.module.scss';

const CreateImportOldContent = ({ callback }: CreateContentProps): JSX.Element => {
    const ref = useRef<HTMLButtonElement>(null);
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

    const handleChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value)
    }

    const handleChangePrompt = (e: React.ChangeEvent<HTMLInputElement>) => {
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
                <span>{Localization.toText('createFilePopup-fileNamePrompt')}:</span>
                <input 
                    value={name} 
                    onChange={handleChangeName}
                    onKeyDown={handleInput}
                    placeholder={Localization.toText('createFilePopup-fileNamePlaceholder')}
                />
            </div>
            <div className={styles.inputRow}>
                <span>{Localization.toText('createFilePopup-importURLPrompt')}:</span>
                <input 
                    value={value} 
                    onChange={handleChangePrompt}
                    onKeyDown={handleInput}
                    placeholder={Localization.toText('createFilePopup-importURLPlaceholder')}
                />
            </div>
            <div className={styles.inputRow}/>
            <div className={styles.inputRow}>
                <button 
                    ref={ref}
                    onClick={handleClick}
                    disabled={!value || !name}> 
                    {Localization.toText('createFilePopup-button-import')}
                </button>
            </div>
        </>
    )
}

export default CreateImportOldContent;