import { useRef, useState } from "react";
import UploadIcon from '@mui/icons-material/Upload';
import RemoveIcon from '@mui/icons-material/Close';
import { closePopup } from "components/common/popupHolder";
import { CreateContentProps } from ".";
import Localization from "utils/localization";
import { InputType } from "types/context/fileSystemContext";
import { FileType } from "types/database/files";
import styles from 'styles/pages/storyPage/createFilePopup.module.scss';
import Logger from "utils/logger";

interface CreateUploadContentState {
    name: string
    fileName: string
    file: string | ArrayBuffer
}

function clearFileInput(input: HTMLInputElement){
    if(input.value){
        try{
            input.value = ''; //for IE11, latest Chrome/Firefox/Opera...
        }catch(err){ }
        if(input.value){ //for IE5 ~ IE10
            var form = document.createElement('form'),
                parentNode = input.parentNode, ref = input.nextSibling;
            form.appendChild(input);
            form.reset();
            parentNode.insertBefore(input,ref);
        }
    }
}

const CreateUploadContent = ({ callback }: CreateContentProps): JSX.Element => {
    const ref = useRef<HTMLButtonElement>(null);
    const [state, setState] = useState<CreateUploadContentState>({
        name: "",
        fileName: "",
        file: null
    })

    const isResources = state.fileName.endsWith("localResources")

    const handleClick = () => {
        try {
            if (isResources) {
                let json = decodeURIComponent(String(state.file))
                callback({ type: InputType.UploadResources, resources: JSON.parse(json) })
            } else {
                callback({ type: InputType.Upload, data: {
                    type: FileType.LocalImage,
                    name: state.name,
                    file: state.file
                }})
            }
        } catch (error) {
            Logger.throw("CreateUploadContent", error)
        }
        closePopup()
    }

    const handleClearClick = () => {
        setState({ ...state, file: null })
    }

    const handleFileUpload: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        const file = e.target.files[0]
        if (file) {
            const reader = new FileReader()
            reader.addEventListener('load', () => {
                let name = file.name.split('.')?.[0] ?? ""
                setState({ ...state, name: name, fileName: file.name, file: reader.result })
            })
            if (file.name.endsWith(".localResources")) {
                reader.readAsText(file)
            } else {
                reader.readAsDataURL(file)
            }
        }
        clearFileInput(e.target)
    }

    const handleChangeName: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        setState({ ...state, name: e.target.value })
    }

    const handleInput: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
        if (e.key === "Enter" && !ref.current.disabled){
            ref.current.click();
            closePopup()
            closePopup()
        }
    }
    

    const Icon = state.file ? RemoveIcon : UploadIcon
    const prompt = state.file ? `Clear file: '${state.fileName}'` : "Click or drag to upload file"

    return (
        <>
            <div className={styles.inputArea}>
                <div className={styles.upload} onClick={handleClearClick}>
                    <input type="file" 
                        onChange={handleFileUpload} 
                        disabled={state.file !== null} 
                        accept=".png, .jpg, .gif, .jpeg, .localResources"/>
                    <Icon/>
                    <div>{prompt}</div>
                </div>
            </div>
            {!isResources &&
                <div className={styles.inputRow}>
                    <span>{Localization.toText('createFilePopup-fileNamePrompt')}:</span>
                    <input 
                        value={state.name} 
                        onChange={handleChangeName}
                        onKeyDown={handleInput}
                        placeholder={Localization.toText('createFilePopup-fileNamePlaceholder')}/>
                </div>
            }
            <div className={styles.inputRowLast}>
                <button
                    ref={ref}
                    onClick={handleClick}
                    disabled={!state.file || !state.file}> 
                    {isResources 
                        ? Localization.toText('createFilePopup-load')
                        : Localization.toText('createFilePopup-button')}
                </button>
            </div>
        </>
    )
}

export default CreateUploadContent;