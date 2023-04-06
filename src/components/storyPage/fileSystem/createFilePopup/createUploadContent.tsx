import { useState } from "react";
import UploadIcon from '@mui/icons-material/Upload';
import { closePopup } from "components/common/popupHolder";
import { CreateContentProps } from ".";
import styles from 'styles/pages/storyPage/createFilePopup.module.scss';

const CreateUploadContent = ({ callback }: CreateContentProps): JSX.Element => {
    const [state, setState] = useState({ file: null })

    const handleFileUpload = () => {
        closePopup()
    }

    return (
        <>
            <div className={styles.inputArea}>
                <div className={styles.upload}>
                    <input type="file" onChange={handleFileUpload}/>
                    <UploadIcon/>
                    <div>Click or drag to upload file</div>
                </div>
            </div>
        </>
    )
}

export default CreateUploadContent;