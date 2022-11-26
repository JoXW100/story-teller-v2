import { useRouter } from 'next/router';
import { useValidation } from 'utils/handleUser'
import SettingsPage from 'components/settingsPage/settingsPage';
import Head from 'next/head'
import styles from 'styles/home.module.scss'

const Page = ({ props }) => {
    const router = useRouter();
    const valid = useValidation(router);

    return (
        <div className={styles.container}>
            <Head>
                <title>Story Teller 2</title>
                <meta name="description" content="Story Teller 2" />
                <link rel="icon" href="/favicon.ico" />
                <meta name="google-site-verification" content="HLSInHx7aA7G6nENh3w_NwmSZlAPOkS7aUuSXNOeNOg" />
            </Head>

            <main>
                { valid && 
                    <SettingsPage returnURL={props?.return ?? ''}/>
                }
            </main>
        </div>
    )
}

export default Page;