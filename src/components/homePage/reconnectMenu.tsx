import Localization from 'utils/localization';
import ReplayIcon from '@mui/icons-material/Replay';
import styles from 'styles/homePage.module.scss'
import { PageStatus } from 'types/homePage';

type ReconnectMenuProps = React.PropsWithRef<{
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