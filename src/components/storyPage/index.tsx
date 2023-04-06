import React, { useContext } from 'react';
import { Context } from 'components/contexts/storyContext';
import Divider from 'components/common/divider'
import Logo from '@mui/icons-material/MenuBookSharp';
import HomeButton from './homeButton';
import SettingsButton from './settingsButton';
import FileView from './fileView';
import FileSystem from "./fileSystem";
import DiceButton from './diceButton';
import RollHistoryButton from './rollHistoryButton';
import HelpMenuButton from './helpMenuButton';
import EditModeButton from './editModeButton';
import styles from 'styles/pages/storyPage/main.module.scss'

const StoryPage = (): JSX.Element => {
    const [context] = useContext(Context);
    return (
        <div className={styles.main}>
            <div className={styles.header}>
                <div className={styles.headerLabel}>
                    <Logo/>
                    { String(context.story.name) }
                </div>
                <HelpMenuButton/>
                <SettingsButton/>
                <EditModeButton editEnabled={context.editEnabled}/>
                <DiceButton/>
                <RollHistoryButton disabled={context.rollHistory.length == 0}/>
                <HomeButton/>
            </div>
            <Divider 
                className={styles.divider}
                minLeft={150}
                defaultSlider={0}
                minRight={100}
                left={<FileSystem/>}
                right={<FileView/>}/>
        </div>
    )
}

export default StoryPage;