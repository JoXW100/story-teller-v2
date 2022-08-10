import Head from 'next/head'
import styles from 'styles/home.module.scss'
import HomePage from 'components/homePage/homePage'
import { useRouter } from 'next/router'
import { useValidation } from 'utils/handleUser';

const Page = () => {
    const router = useRouter();
    const valid = useValidation(router);

    return (
        <div className={styles.container}>
            <Head>
                <title>Story Teller 2</title>
                <meta name="description" content="Story Teller 2" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main>
                { valid ? <HomePage/> : null }
            </main>
        </div>
    )
}

export default Page;