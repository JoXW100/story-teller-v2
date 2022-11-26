import Head from 'next/head'
import StoryPage from 'components/storyPage/storyPage'
import StoryContext from 'components/contexts/storyContext'
import { useValidation } from 'utils/handleUser'
import { useRouter } from 'next/router'
import styles from 'styles/home.module.scss'

/**
 * 
 * @param {{ props: { storyId: string, fieldId: [string], edit: ?string }}} 
 * @returns {JSX.Element}
 */

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
                    <StoryContext 
                        editMode={props.edit === 'true'}
                        storyId={props.storyId} 
                        fileId={props.fieldId?.find(() => true)}
                    >
                        <StoryPage/>
                    </StoryContext>
                }
            </main>
        </div>
    )
}

export default Page;