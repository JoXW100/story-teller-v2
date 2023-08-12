import { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import Localization from 'utils/localization';
import Communication from 'utils/communication';
import { DBResponse } from 'types/database';
import { PageStatus } from 'types/homePage';
import { StoryAddResult } from 'types/database/responses';
import styles from 'styles/pages/homePage/menu.module.scss';

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
        Communication.addStory(name, desc)
        .then((res: DBResponse<StoryAddResult>) =>  {
            if (res.success) {
                setStatus(PageStatus.Loading)
            } else {
                setName("")
                setDesc("")
            }
        })
    }

    return (
        <div className={styles.createMenu}>
            <div className={styles.menuHeader}>
                <label>
                    { Localization.toText('createStory-header') }
                </label>
                <button onClick={handleConfirm} disabled={disabled}>
                    { Localization.toText('createStory-confirmation') }
                </button>
                <button onClick={handleBack}>
                    <CloseIcon/>
                </button>
            </div>
            <div className={styles.inputRow}>
                <label>
                    { Localization.toText('createStory-namePrompt') + ':' }
                </label>
                <input 
                    placeholder={Localization.toText('createStory-namePlaceholder')} 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}/>
            </div>
            <div className={styles.inputRow}>
                { Localization.toText('createStory-descPrompt') + ':' }
                <input 
                    placeholder={Localization.toText('createStory-descPlaceholder')} 
                    value={desc} 
                    onChange={(e) => setDesc(e.target.value)}/>
            </div>
        </div>
    )
}

export default CreateStoryMenu;