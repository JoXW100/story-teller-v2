import { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { closePopup } from 'components/common/popupHolder';
import Localization from 'utils/localization';
import styles from 'styles/pages/homePage/menu.module.scss';

type EditStoryPopupProps = React.PropsWithRef<{
    values: { name: string, desc: string },
    callback: (data: { name: string, desc: string }) => void
}>

const EditStoryPopup = ({ values, callback }: EditStoryPopupProps):JSX.Element => {
    const [state, setState] = useState({ 
        name: values.name ? values.name : "", 
        desc: values.desc ? values.desc : "" 
    })
    const disabled = !state.name 
        || !state.desc 
        || (values.name === state.name && values.desc === state.desc)

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
            <div className={styles.menuHeader}>
                { Localization.toText('editStoryPopup-header') }
                <button onClick={handleConfirm} disabled={disabled}>
                    { Localization.toText('editStoryPopup-confirmation') }
                </button>
                <button onClick={handleBack}>
                    <CloseIcon sx={{width: "100%", height: "100%" }}/>
                </button>
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