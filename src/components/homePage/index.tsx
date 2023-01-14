import { useEffect, useMemo, useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0';
import LogoutIcon from '@mui/icons-material/LogoutSharp';
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
import styles from 'styles/homePage.module.scss'

interface HomePageState {
    loading: boolean
    connected: boolean
    cards: StoryCardData[]
    status: PageStatus
}

type HomePageMenu = (props: React.PropsWithRef<{
    cards?: StoryCardData[]
    setStatus?: (status: PageStatus) => void
}>) => JSX.Element 

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

    const handleFetch = (res: DBResponse<StoryGetAllResult>) => {
        let cards: StoryCardData[] = res.success 
            ? res.result.map((story) => ({ ...story, type: CardType.Story })) 
            : []
        setState({ 
            ...state, 
            status: PageStatus.Select,
            loading: false,
            connected: res.success,
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
                Communication.isConnected()
                .then(handleConnect)
            case PageStatus.Loading:
                Communication.getAllStories()
                .then(handleFetch)
                break;
            default:
                break;
        }
    }, [state.status])

    return (
        <div className={styles.main}>
            <div className={styles.mainPanel}>
                <Link className={styles.logoutButton} href={Navigation.logoutAPI()} passHref>
                    {`${Localization.toText('home-logout')} ${user?.name}`}
                    <LogoutIcon/>
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