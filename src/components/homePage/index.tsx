import { useEffect, useMemo, useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0';
import LogoutIcon from '@mui/icons-material/LogoutSharp';
import SettingsIcon from '@mui/icons-material/SettingsSharp';
import Link from 'next/link';
import Communication from 'utils/communication';
import Navigation from 'utils/navigation';
import Localization from 'utils/localization';
import Loading from 'components/common/loading';
import SelectStoryMenu from './selectStoryMenu';
import CreateStoryMenu from './createStoryMenu';
import ReconnectMenu from './reconnectMenu';
import { DBResponse } from 'types/database';
import { StoryGetAllResult } from 'types/database/stories';
import { CardType, PageStatus, StoryCardData } from 'types/homePage';
import styles from 'styles/pages/homePage/main.module.scss'

interface HomePageState {
    loading: boolean
    connected: boolean
    cards: StoryCardData[]
    status: PageStatus
}

type HomePageMenuProps = React.PropsWithRef<{
    cards?: StoryCardData[]
    setStatus?: (status: PageStatus) => void
}>

type HomePageMenu = (props: HomePageMenuProps) => JSX.Element 

const createCard: StoryCardData = {
    id: null,
    name: '',
    desc: '',
    dateCreated: 0,
    dateUpdated: Number.MAX_VALUE,
    type: CardType.Create,
}

const HomePage = (): JSX.Element => {
    const { user } = useUser();
    const [state, setState] = useState<HomePageState>({
        loading: true,
        connected: false,
        status: PageStatus.Connecting,
        cards: [createCard]
    })

    const handleConnect = (connected: boolean) => {
        setState({ 
            ...state, 
            status: connected ? PageStatus.Loading : PageStatus.NoConnection, 
            connected: connected 
        })
    }

    const handleGetAllStories = (res: DBResponse<StoryGetAllResult>) => {
        let cards: StoryCardData[] = res.success 
            ? res.result.map((story) => ({ ...story, type: CardType.Story })) 
            : []
        setState({ 
            ...state, 
            loading: false,
            connected: res.success,
            status: PageStatus.Select,
            cards: [createCard, ...cards]
        })
    }

    const handleSetStatus = (status: PageStatus) => { 
        setState({ ...state, status: status }) 
    }
    
    const Content = useMemo<HomePageMenu>(() => {
        switch (state.status) {
            case PageStatus.Loading:
            case PageStatus.Connecting:
                return LoadingMenu
            case PageStatus.Create:
                return CreateStoryMenu
            case PageStatus.Select:
                return SelectStoryMenu
            case PageStatus.NoConnection:
            default:
                return ReconnectMenu
        }
    }, [state.status])
    
    useEffect(() => {
        switch (state.status) {
            case PageStatus.Connecting:
                Communication.isConnected().then(handleConnect)
            case PageStatus.Loading:
                Communication.getAllStories().then(handleGetAllStories)
                break;
            default:
                break;
        }
    }, [state.status])

    return (
        <div className={styles.main}>
            <div className={styles.pageHeader}>
                <Link className={styles.logoutButton} href={Navigation.logoutAPI()} passHref>
                    <label>
                        { Localization.toText('home-logout', user?.name ?? "") }
                    </label>
                    <LogoutIcon/>
                </Link>
                <Link className={styles.settingsButton} href={Navigation.settingsURL()} passHref>
                    <button tooltips={Localization.toText('storyPage-openSettingsMenu')}>
                        <SettingsIcon/>
                    </button>
                </Link>
            </div>
            <div className={styles.mainContainer}>
                <div className={styles.mainHeader}>
                    { Localization.toText('home-title') }
                </div>
                <Content cards={state.cards} setStatus={handleSetStatus}/>
            </div>
        </div>
    )
}

const LoadingMenu = () => (
    <Loading className={styles.loading}/>
)

export default HomePage;