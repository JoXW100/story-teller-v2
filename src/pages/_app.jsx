import ContextMenu from 'components/contextMenu'
import AppContext from 'components/contexts/appContext'
import PopupHolder from 'components/popupHolder'
import { UserProvider } from '@auth0/nextjs-auth0';
import 'styles/globals.scss'

function MyApp({ Component, pageProps, router }) {
    return (
        <UserProvider>
            <AppContext>
                <Component {...pageProps} props={router.query} />
                <ContextMenu/>
                <PopupHolder/>
            </AppContext>
        </UserProvider>
    )
}

export default MyApp
