import Link from 'next/link';
import SettingsIcon from '@mui/icons-material/SettingsSharp';
import Localization from 'classes/localization';
import Navigation from 'utils/navigation';
import styles from 'styles/storyPage/main.module.scss'
import '@types/fileContext'

const SettingsButton = () => {
    return (
        <Link href={Navigation.SettingsURL()}>
            <div 
                className={styles.settings} 
                tooltips={Localization.toText('storyPage-openSettingsMenu')}
            >
                <SettingsIcon sx={{ height: "100%" }}/>
            </div>
        </Link>
    )
}

export default SettingsButton;