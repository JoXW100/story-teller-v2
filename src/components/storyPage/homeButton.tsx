import Link from 'next/link';
import HomeIcon from '@mui/icons-material/HomeSharp';
import Localization from 'utils/localization';
import Navigation from 'utils/navigation';
import styles from 'styles/storyPage/main.module.scss'

const HomeButton = (): JSX.Element => {
    return (
        <Link href={Navigation.originURL()} passHref>
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