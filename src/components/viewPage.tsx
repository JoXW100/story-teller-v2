import { useContext } from 'react'
import { Context as FileContext } from 'components/contexts/fileContext'
import { Context as StoryContext } from 'components/contexts/storyContext'
import useRenderer from 'components/renderer'
import DiceButton from 'components/storyPage/diceButton'
import HomeButton from 'components/storyPage/homeButton'
import RollHistoryButton from 'components/storyPage/rollHistoryButton'
import SettingsButton from 'components/storyPage/settingsButton'
import Templates from 'data/fileTemplates'
import styles from 'styles/renderer.module.scss'
import Loading from './common/loading'

const ViewPage = (): JSX.Element => {
    const [context] = useContext(FileContext)
    const [storyContext] = useContext(StoryContext)
    const render = useRenderer(Templates[context.file?.type]?.renderer, context.file)
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <HomeButton/>
                <SettingsButton/>
                <RollHistoryButton disabled={storyContext.rollHistory.length == 0}/>
                <DiceButton/>
            </div>
            <div className={styles.main}>
                <div className={styles.innerPage}>
                    { context.fetching
                        ? <Loading className={styles.loading}/> 
                        : render 
                    }
                </div>
            </div>
        </div>
    )
}

export default ViewPage