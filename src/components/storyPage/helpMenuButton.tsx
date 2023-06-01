import HelpIcon from '@mui/icons-material/QuestionMarkSharp';
import Localization from 'utils/localization';
import styles from 'styles/pages/storyPage/main.module.scss';
import { openPopup } from 'components/common/popupHolder';
import HelpMenu from './helpMenu';

const HelpMenuButton = (): JSX.Element => {
    const handleClick = () => {
        openPopup(<HelpMenu/>)
    }

    return (
        <button 
            className={styles.headerButton} 
            onClick={handleClick}
            tooltips={Localization.toText('storyPage-helpMenu')}
        >
            <HelpIcon/>
        </button>
    )
}

export default HelpMenuButton