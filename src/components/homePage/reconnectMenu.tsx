import ReplayIcon from '@mui/icons-material/Replay';
import Localization from 'utils/localization';
import { PageStatus } from 'types/homePage';
import styles from 'styles/pages/homePage/menu.module.scss';

type ReconnectMenuProps = React.PropsWithRef<{
    setStatus: (status: PageStatus) => void
}>

const ReconnectMenu = ({ setStatus }: ReconnectMenuProps):JSX.Element => {

    const handleClick = () => {
        setStatus(PageStatus.Connecting)
    }

    return (
        <button className={styles.reconnectMenu} onClick={handleClick}>
            { Localization.toText('reconnect-button') }
            <ReplayIcon/>
        </button>
    )
}

export default ReconnectMenu;