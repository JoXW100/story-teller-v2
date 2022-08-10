import { useEffect, useMemo, useState } from 'react';
import { PageStatus } from '@types/homePage';
import { useUser } from '@auth0/nextjs-auth0';
import LogoutIcon from '@mui/icons-material/LogoutSharp';
import Loading from 'components/loading';
import SelectStoryMenu from './selectStoryMenu';
import CreateStoryMenu from './createStoryMenu';
import ReconnectMenu from './reconnectMenu';
import Localization from 'classes/localization';
import styles from 'styles/homePage/main.module.scss'
import '@types/homePage'

/**
 * @typedef {import('@types/homePage').HomePageState} State
 */

/**
 * @returns {JSX.Element}
 */
const HomePage = () => {
    const { user } = useUser();

    /** @type {[state: State, setState: React.Dispatch<State>]} */
    const [state, setState] = useState({
        loading: true,
        connected: false,
        status: PageStatus.Connecting,
        cards: [{ type: 'create', updated: Number.MAX_VALUE }]
    })

    const handleConnect = (res) => {
        var connected = res.success && res.result;
        setState((state) => ({ 
            ...state, 
            status: connected 
                ? PageStatus.Loading 
                : PageStatus.NoConnection, 
            connected: connected 
        }))
    } 

    /** @param {DBResponse<[DBStory]>} res */
    const handleFetch = (res) => {
        let cards = res.success 
            ? res.result.map((story) => ({ ...story, type: "default"}))
            : [];
        
        setState({ 
            ...state, 
            status: PageStatus.Select,
            loading: false,
            connected: res.success && res.result,
            cards: [{ 
                type: 'create', 
                updated: Number.MAX_VALUE 
            }].concat(cards)
        })
    }
    
    useEffect(() => {
        switch (state.status) {
            case PageStatus.Loading:
                fetch('/api/database/getAllStories', { method: 'GET' })
                .then((res) => res.json())
                .then((res) => handleFetch(res))
                .catch((console.error))
                break;
            case PageStatus.Connecting:
                fetch('/api/database/isConnected', { method: 'GET' })
                .then((res) => res.json())
                .then((res) => handleConnect(res))
                .catch((console.error))
            default:
                break;
        }
    }, [state.status])
    
    const Content = useMemo(() => {
        switch (state.status) {
            case PageStatus.Loading:
            case PageStatus.Connecting:
                return () => (<Loading className={styles.loading}/>)
            case PageStatus.Create:
                return CreateStoryMenu
            case PageStatus.Select:
                return SelectStoryMenu
            case PageStatus.NoConnection:
                return ReconnectMenu
            default:
                return ReconnectMenu
        }
    }, [state.status, state.connected])

    return (
        <div className={styles.main}>
            <div className={styles.userPanel}>
                <a 
                    className={styles.logoutButton}
                    href="/api/auth/logout"
                >
                    { `Logout ${user?.name}` }
                    <LogoutIcon/>
                </a>
            </div>
            <div className={styles.container}>
                <div className={styles.headerBox}>
                    <div className={styles.text}>
                        { Localization.toText('home-title') }
                    </div>
                </div>
                { <Content state={state} setState={setState}/> }
            </div>
        </div>
    )
}

export default HomePage;