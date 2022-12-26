import Head from 'next/head';
import ContextMenu from 'components/common/contextMenu'
import PopupHolder from 'components/common/popupHolder'
import AppContext from 'components/contexts/appContext'
import { UserProvider } from '@auth0/nextjs-auth0';
import 'styles/globals.scss'

function MyApp({ Component, pageProps, router }) {
    return (
        <UserProvider>
            <Head>
                <title>Story Teller 2</title>
                <link rel="icon" href="/favicon.ico" />
                <meta name="description" content="Story Teller 2" />
                <meta name="google-site-verification" content="HLSInHx7aA7G6nENh3w_NwmSZlAPOkS7aUuSXNOeNOg" />
            </Head>
            <AppContext>
                <Component {...pageProps} props={router.query} />
                <ContextMenu/>
                <PopupHolder/>
            </AppContext>
        </UserProvider>
    )
}

export default MyApp
