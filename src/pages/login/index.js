import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@auth0/nextjs-auth0';
import Head from 'next/head'
import styles from 'styles/home.module.scss'
import LoginPage from 'components/loginPage/loginPage';

const Page = () => {
    const router = useRouter();
    const { user, error, isLoading } = useUser();

    useEffect(() => {
        if (user && !isLoading) {
            router.push('../')
        }
    }, [user, isLoading])

    return (
        <div className={styles.container}>
            <Head>
                <title>Story Teller 2</title>
                <meta name="description" content="Story Teller 2" />
                <link rel="icon" href="/favicon.ico" />
                <meta name="google-site-verification" content="HLSInHx7aA7G6nENh3w_NwmSZlAPOkS7aUuSXNOeNOg" />
            </Head>

            <main>
                { isLoading ? null : <LoginPage/> }
            </main>
        </div>
    )
}

export default Page;