import Localization from 'utils/localization';
import ReplayIcon from '@mui/icons-material/Replay';
import { HomePageState, PageStatus } from '.';
import styles from 'styles/homePage.module.scss'

type ReconnectMenuProps = React.PropsWithRef<{
    state: HomePageState,
    setStatus: (status: PageStatus) => void
}>

const ReconnectMenu = ({ setStatus }: ReconnectMenuProps):JSX.Element => {

    const handleClick = () => {
        setStatus(PageStatus.Connecting)
    }

    return (
        <div className={styles.reconnect} onClick={handleClick}>
            <ReplayIcon/>
            { Localization.toText('reconnect-button') }
        </div>
    )
}

export default ReconnectMenu;