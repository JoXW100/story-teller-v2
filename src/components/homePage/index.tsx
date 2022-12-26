import { useEffect, useMemo, useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0';
import LogoutIcon from '@mui/icons-material/LogoutSharp';
import Link from 'next/link';
import Loading from 'components/common/loading';
import SelectStoryMenu from './selectStoryMenu';
import CreateStoryMenu from './createStoryMenu';
import ReconnectMenu from './reconnectMenu';
import Localization from 'utils/localization';
import styles from 'styles/homePage.module.scss'
import { DateValue, DBResponse, UserId } from 'types/database';
import { DBStory, StoryGetAllResult } from 'types/database/stories';
import { ObjectId } from 'mongodb';

interface StoryCardData {
    _id?: ObjectId
    _userId?: UserId
    type: string
    name?: string
    desc?: string
    dateCreated?: DateValue
    dateUpdated: DateValue
}

interface HomePageState {
    loading: boolean
    connected: boolean
    cards: StoryCardData[]
    status: PageStatus
}

export enum PageStatus {
    Loading = 0,
    Select = 1,
    Create = 2,
    Connecting = 3,
    NoConnection = 4
}

export type {
    StoryCardData,
    HomePageState
}

const HomePage = (): JSX.Element => {
    const { user } = useUser();

    const [state, setState] = useState({
        loading: true,
        connected: false,
        status: PageStatus.Connecting,
        cards: [{ type: 'create', dateUpdated: Number.MAX_VALUE }]
    } as HomePageState)

    const handleConnect = (res: DBResponse<boolean>) => {
        var connected = res.success && res.result as boolean;
        setState({ 
            ...state, 
            status: connected ? PageStatus.Loading : PageStatus.NoConnection, 
            connected: connected 
        })
    }

    const handleFetch = (res: DBResponse<StoryGetAllResult>) => {
        let cards: StoryCardData[] = res.success 
            ? (res.result as DBStory[]).map((story) => ({ ...story, type: "default"}))
            : [];
        setState({ 
            ...state, 
            status: PageStatus.Select,
            loading: false,
            connected: Boolean(res.success && res.result),
            cards: [{ type: 'create', dateUpdated: Number.MAX_VALUE }, ...cards]
        })
    }

    const handleSetStatus = (status: PageStatus) => { 
        setState({ ...state, status: status }) 
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
                .then(handleConnect)
                .catch((console.error))
            default:
                break;
        }
    }, [state.status])
    
    const Content = useMemo(() => {
        switch (state.status) {
            case PageStatus.Loading:
            case PageStatus.Connecting:
                return LoadingMenu
            case PageStatus.Create:
                return CreateStoryMenu
            case PageStatus.Select:
                return SelectStoryMenu
            case PageStatus.NoConnection:
                return ReconnectMenu
            default:
                return ReconnectMenu
        }
    }, [state.status])

    return (
        <div className={styles.main}>
            <div className={styles.mainPanel}>
                <Link href="/api/auth/logout">
                    <div className={styles.logoutButton}>
                        {`Logout ${user?.name}`}
                        <LogoutIcon/>
                    </div>
                </Link>
            </div>
            <div className={styles.mainContainer}>
                <div className={styles.mainHeader}>
                    { Localization.toText('home-title') }
                </div>
                <Content state={state} setStatus={handleSetStatus}/>
            </div>
        </div>
    )
}

const LoadingMenu = () => {
    return <Loading className={styles.loading}/>
}

export default HomePage;