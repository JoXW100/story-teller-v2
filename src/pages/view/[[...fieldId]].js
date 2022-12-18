import Head from 'next/head'
import styles from 'styles/home.module.scss'
import ViewPage from 'components/viewPage/viewPage'
import FileContext from 'components/contexts/fileContext'
import StoryContext from 'components/contexts/storyContext'

/**
 * 
 * @param {{ props: { fieldId: [string] }}} 
 * @returns {JSX.Element}
 */

const Page = ({ props }) => {
    
    return (
        <div className={styles.container}>
            <Head>
                <title>Story Teller 2</title>
                <meta name="description" content="Story Teller 2" />
                <link rel="icon" href="/favicon.ico" />
                <meta name="google-site-verification" content="HLSInHx7aA7G6nENh3w_NwmSZlAPOkS7aUuSXNOeNOg" />
            </Head>

            <main>
                <StoryContext viewMode={true}>
                    <FileContext fileId={props.fieldId?.find(() => true)}>
                        <ViewPage/>
                    </FileContext>
                </StoryContext>
            </main>
        </div>
    )
}

export default Page;