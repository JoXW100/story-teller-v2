import { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import Localization from 'utils/localization';
import { StoryAddResult } from 'types/database/stories';
import { DBResponse } from 'types/database';
import { PageStatus } from 'types/homePage';
import styles from 'styles/homePage.module.scss'

type CreateStoryMenuProps = React.PropsWithRef<{
    setStatus: (status: PageStatus) => void
}>

const CreateStoryMenu = ({ setStatus }: CreateStoryMenuProps): JSX.Element => {
    const [name, setName] = useState("")
    const [desc, setDesc] = useState("")
    const disabled = !name || !desc

    const handleBack = () => {
        setStatus(PageStatus.Select)
    }

    const handleConfirm = () => {
        fetch('/api/database/addStory', { method: 'PUT', body: JSON.stringify({name: name, desc: desc })})
        .then((res) => res.json())
        .then((res: DBResponse<StoryAddResult>) =>  {
            if (!res.success)
                throw new Error(res.result as string);
                setStatus(PageStatus.Loading)
        })
        .catch((console.error))
    }

    return (
        <div className={styles.createMenu}>
            <div className={styles.menuHeader}>
                { Localization.toText('createStory-header') }
                <div className={styles.backButton} onClick={handleBack}>
                    <CloseIcon sx={{width: "100%", height: "100%" }}/>
                </div>
                <div
                    className={styles.confirmButton}
                    onClick={handleConfirm}
                    disabled={disabled}
                >
                    { Localization.toText('createStory-confirmation') }
                </div>
            </div>
            <div className={styles.inputRow}>
                { Localization.toText('createStory-namePrompt') + ':' }
                <input 
                    placeholder={Localization.toText('createStory-namePlaceholder')} 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                />
            </div>
            <div className={styles.inputRow}>
                { Localization.toText('createStory-descPrompt') + ':' }
                <input 
                    placeholder={Localization.toText('createStory-descPlaceholder')} 
                    value={desc} 
                    onChange={(e) => setDesc(e.target.value)}
                />
            </div>
        </div>
    )
}

export default CreateStoryMenu;