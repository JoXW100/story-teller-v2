import { useState } from 'react';
import { PageStatus } from '@types/homePage';
import CloseIcon from '@mui/icons-material/Close';
import Localization from 'classes/localization';
import styles from 'styles/homePage/createMenu.module.scss'
import '@types/homePage'

/**
 * @param {{state: HomePageState, setState: React.Dispatch<HomePageState>}} 
 * @returns {JSX.Element}
 */
const CreateStoryMenu = ({ state: homeState, setState: setHomeState }) => {
    const [state, setState] = useState({ name: "", desc: "" })

    const handleBack = () => {
        setHomeState({ ...homeState, status: PageStatus.Select })
    }

    const handleConfirm = () => {
        fetch('/api/database/addStory', { 
            method: 'PUT', 
            body: JSON.stringify({ name: state.name, desc: state.desc }) 
        })
        .then((res) => res.json())
        .then((res) =>  {
            if (res.success) {
                setHomeState({ ...homeState, status: PageStatus.Loading })
                return;
            }
            throw new Error(res.result);
        })
        .catch((console.error))
    }

    return (
        <div className={styles.createMenu}>
            <div className={styles.text}>
                { Localization.toText('createStory-header') }
                <div 
                    className={styles.backButton}
                    onClick={handleBack}
                >
                    <CloseIcon sx={{width: "100%", height: "100%" }}/>
                </div>
                <div 
                    className={styles.confirmButton}
                    disabled={!state.name || !state.desc}
                    onClick={handleConfirm}
                >
                    { Localization.toText('createStory-confirmation') }
                </div>
            </div>
            <div className={styles.inputRow}>
                { Localization.toText('createStory-namePrompt') + ':' }
                <input 
                    placeholder={Localization.toText('createStory-namePlaceholder')} 
                    value={state.name} 
                    onChange={(e) => setState({ ...state, name: e.target.value })}
                />
            </div>
            <div className={styles.inputRow}>
                { Localization.toText('createStory-descPrompt') + ':' }
                <input 
                    placeholder={Localization.toText('createStory-descPlaceholder')} 
                    value={state.desc} 
                    onChange={(e) => setState({ ...state, desc: e.target.value })}
                />
            </div>
        </div>
    )
}

export default CreateStoryMenu;