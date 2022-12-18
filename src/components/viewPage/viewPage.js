import { Context as FileContext } from 'components/contexts/fileContext'
import { Context as StoryContext } from 'components/contexts/storyContext'
import useRenderer from 'components/renderer'
import DiceButton from 'components/storyPage/diceButton'
import HomeButton from 'components/storyPage/homeButton'
import RollHistoryButton from 'components/storyPage/rollHistoryButton'
import SettingsButton from 'components/storyPage/settingsButton'
import Templates from 'data/fileTemplates'
import { useContext, useRef } from 'react'
import styles from 'styles/renderer.module.scss'

/**
 * @returns {JSX.Element}
 */
const ViewPage = () => {
    const [context] = useContext(FileContext)
    const [storyContext] = useContext(StoryContext)
    const render = useRenderer(Templates[context?.file?.type]?.renderer, context?.file)
    const ref = useRef(null)
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <HomeButton/>
                <SettingsButton/>
                <DiceButton/>
                <RollHistoryButton disabled={storyContext.rollHistory.length == 0}/>
            </div>
            <div className={styles.main}>
                <div ref={ref} className={styles.innerPage}>
                    { render }
                </div>
            </div>
        </div>
    )
}

export default ViewPage