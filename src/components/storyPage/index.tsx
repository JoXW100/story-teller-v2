import React, { useContext } from 'react';
import { Context } from 'components/contexts/storyContext';
import Divider from 'components/common/controls/divider'
import Logo from '@mui/icons-material/MenuBookSharp';
import HomeButton from '../common/homeButton';
import SettingsButton from '../common/settingsButton';
import FileView from './fileView';
import FileSystem, { FileSystemCollapsedBody } from "./fileSystem";
import DiceButton from './dicePanel/diceButton';
import RollHistoryButton from '../common/rollHistory/rollHistoryButton';
import HelpMenuButton from './helpMenuButton';
import EditModeButton from './editModeButton';
import { isObjectId } from 'utils/helpers';
import styles from 'styles/pages/storyPage/main.module.scss'

const StoryPage = (): JSX.Element => {
    const [context] = useContext(Context);
    return (
        <div className={styles.main}>
            <div className={styles.header}>
                <Logo/>
                <label>
                    {String(context.story.name)}
                </label>
                <HelpMenuButton/>
                <SettingsButton/>
                <EditModeButton editEnabled={context.editEnabled} disabled={!isObjectId(context.fileId)}/>
                <DiceButton/>
                <RollHistoryButton disabled={context.rollHistory.length == 0}/>
                <HomeButton/>
            </div>
            <Divider 
                className={styles.divider}
                minLeft={150}
                minRight={100}
                defaultSlider={0}
                collapsed={!context.sidePanelExpanded}
                left={<FileSystem key="system"/>}
                collapsedLeft={<FileSystemCollapsedBody/>}
                right={<FileView key="file"/>}/>
        </div>
    )
}

export default StoryPage;