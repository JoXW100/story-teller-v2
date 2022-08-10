import Localization from 'classes/localization';
import ReplayIcon from '@mui/icons-material/Replay';
import { PageStatus } from '@types/homePage';
import styles from 'styles/homePage/main.module.scss'
import '@types/homePage'

/**
 * @param {{state: HomePageState, setState: React.Dispatch<HomePageState>}} 
 * @returns {JSX.Element}
 */
const ReconnectMenu = ({ state, setState }) => {

    const handleClick = () => {
        setState({ ...state, status: PageStatus.Loading })
    }

    return (
        <div 
            className={styles.reconnect}
            onClick={() => handleClick()}
        >
            <div className={styles.icon}>
                <ReplayIcon sx={{
                    width: "100%",
                    height: "100%",
                    color: 'rgb(110, 52, 52)'
                }}/>
            </div>
            { Localization.toText('reconnect-button') }
        </div>
    )
}

export default ReconnectMenu;