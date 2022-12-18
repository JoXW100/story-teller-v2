import Link from 'next/link';
import HomeIcon from '@mui/icons-material/HomeSharp';
import Localization from 'classes/localization';
import Navigation from 'utils/navigation';
import styles from 'styles/storyPage/main.module.scss'
import '@types/fileContext'

const HomeButton = () => {
    return (
        <Link href={Navigation.OriginURL()}>
            <div 
                className={styles.home} 
                tooltips={Localization.toText('storyPage-home')}
            >
                <HomeIcon sx={{ height: "100%" }}/>
            </div>
        </Link>
    )
}

export default HomeButton;