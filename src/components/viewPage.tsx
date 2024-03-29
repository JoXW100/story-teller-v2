import { useContext } from 'react'
import { Context as FileContext } from 'components/contexts/fileContext'
import { Context as StoryContext } from 'components/contexts/storyContext'
import DiceButton from 'components/storyPage/dicePanel/diceButton'
import HomeButton from 'components/common/homeButton'
import RollHistoryButton from 'components/common/rollHistory/rollHistoryButton'
import SettingsButton from 'components/common/settingsButton'
import Renderer from './storyPage/renderer'
import Templates from 'data/fileTemplates'
import styles from 'styles/pages/viewPage.module.scss'

const ViewPage = (): JSX.Element => {
    const [context] = useContext(FileContext)
    const [storyContext] = useContext(StoryContext)
    
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <HomeButton/>
                <SettingsButton/>
                <RollHistoryButton disabled={storyContext.rollHistory.length == 0}/>
                <DiceButton/>
            </div>
            <Renderer template={Templates[context.file?.type]?.renderer}/>
        </div>
    )
}

export default ViewPage