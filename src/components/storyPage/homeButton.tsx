import Link from 'next/link';
import HomeIcon from '@mui/icons-material/HomeSharp';
import Localization from 'utils/localization';
import Navigation from 'utils/navigation';
import styles from 'styles/pages/storyPage/main.module.scss'

const HomeButton = (): JSX.Element => {
    return (
        <Link href={Navigation.originURL()} passHref>
            <button 
                className={styles.mobileVisibleHeaderButton}
                tooltips={Localization.toText('storyPage-home')}>
                <HomeIcon/>
            </button>
        </Link>
    )
}

export default HomeButton;