import Head from 'next/head';
import { UserProvider } from '@auth0/nextjs-auth0';
import ContextMenu from 'components/common/contextMenu'
import PopupHolder from 'components/common/popupHolder'
import AppContext from 'components/contexts/appContext'
import Navigation from 'utils/navigation';
import 'styles/globals.scss'
import 'styles/language.scss';

function MyApp({ Component, pageProps, router }) {
    return (
        <UserProvider loginUrl={Navigation.loginAPI()}>
            <Head>
                <title key="title">Story Teller 2</title>
                <link rel="icon" href="/storyteller.ico" />
                <meta name="google-site-verification" content="HLSInHx7aA7G6nENh3w_NwmSZlAPOkS7aUuSXNOeNOg" />
                <meta key="description" name="description" content="Create your own story!" />
                <meta key="og:title" property="og:title" content="Story Teller 2"/>
                <meta key="og:description" property="og:description" content="Create your own story!"/>
                <meta key="og:type" property="og:type" content="website" />
                <meta key="og:image" property="og:image" content="https://story-teller-v2.vercel.app/storyteller.png"/>
                <meta key="twitter:card" property="twitter:card" content="summary"/>
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