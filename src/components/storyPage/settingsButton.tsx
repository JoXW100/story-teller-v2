import Link from 'next/link';
import SettingsIcon from '@mui/icons-material/SettingsSharp';
import Localization from 'utils/localization';
import Navigation from 'utils/navigation';
import styles from 'styles/storyPage/main.module.scss'

const SettingsButton = (): JSX.Element => {
    return (
        <Link href={Navigation.settingsURL()} passHref>
            <button 
                className={styles.headerButton}
                tooltips={Localization.toText('storyPage-openSettingsMenu')}
            >
                <SettingsIcon/>
            </button>
        </Link>
    )
}

export default SettingsButton;