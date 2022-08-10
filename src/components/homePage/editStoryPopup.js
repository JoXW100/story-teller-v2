import { useState } from 'react';
import { closePopup } from 'components/popupHolder';
import CloseIcon from '@mui/icons-material/Close';
import Localization from 'classes/localization';
import styles from 'styles/homePage/createMenu.module.scss'

/**
 * @param {{ 
 *   values: { name: string, desc: string } 
 *   callback: (data: ?{ name: string, desc: string }) => void }}
 * @returns {JSX.Element}
 */
const EditStoryPopup = ({ values, callback }) => {
    const [state, setState] = useState({ 
        name: values.name ? values.name : "", 
        desc: values.desc ? values.desc : "" 
    })

    const handleBack = () => {
        callback(null)
        closePopup()
    }

    const handleConfirm = () => {
        callback(state)
        closePopup()
    }

    return (
        <div className={styles.editMenu}>
            <div className={styles.text}>
                { Localization.toText('editStoryPopup-header') }
                <div 
                    className={styles.backButton}
                    onClick={handleBack}
                >
                    <CloseIcon sx={{width: "100%", height: "100%" }}/>
                </div>
                <div 
                    className={styles.confirmButton}
                    disabled={!state.name || !state.desc || (values.name === state.name && values.desc === state.desc) }
                    onClick={handleConfirm}
                >
                    { Localization.toText('editStoryPopup-confirmation') }
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

export default EditStoryPopup;