import React, { useContext, useMemo } from 'react';
import { Context } from 'components/contexts/storyContext';
import Link from 'next/link';
import Logo from '@mui/icons-material/MenuBookSharp';
import EnableEditIcon from '@mui/icons-material/EditSharp';
import DisableEditIcon from '@mui/icons-material/EditOffSharp';
import HelpIcon from '@mui/icons-material/QuestionMarkSharp';
import HomeButton from './homeButton';
import SettingsButton from './settingsButton';
import Divider from 'components/divider'
import FileView from './fileView';
import FileSystem from "./fileSystem/fileSystem";
import DiceButton from './diceButton';
import RollHistoryButton from './rollHistoryButton';
import Localization from 'classes/localization';
import Navigation from 'utils/navigation';
import styles from 'styles/storyPage/main.module.scss'
import '@types/fileContext'

/**
 * @returns {JSX.Element}
 */
const StoryPage = () => {
    const [context, dispatch] = useContext(Context);
    return (
        <div className={styles.main}>
            <div className={styles.header}>
                <div className={styles.name}>
                    <Logo/>
                    { String(context.story.name) }
                </div>
                <div className={styles.headerMenu}>
                    <HelpMenuButton dispatch={dispatch}/>
                    <SettingsButton/>
                    <EditModeButton editEnabled={context.editEnabled}/>
                    <DiceButton/>
                    <RollHistoryButton disabled={context.rollHistory.length == 0}/>
                    <HomeButton/>
                </div>
            </div>
            <Divider 
                className={styles.divider}
                minLeft={150}
                defaultSlider={0}
                minRight={100}
                left={<FileSystem/>}
                right={<FileView/>}
            />
        </div>
    )
}



/**
 * @param {{ dispatch: StoryContextDispatch }} 
 * @returns {JSX.Element}
 */
const HelpMenuButton = ({ dispatch }) => {
    const handleClick = () => {
        dispatch.openHelpMenu()
    }

    return (
        <div 
            className={styles.help} 
            tooltips={Localization.toText('storyPage-helpMenu')}
            onClick={handleClick}
        >
            <HelpIcon/>
        </div>
    )
}

/**
 * @param {{ editEnabled: boolean }} 
 * @returns {JSX.Element}
 */
const EditModeButton = ({ editEnabled }) => {
    const data = useMemo(() => {
        var data = {};
        if (editEnabled) {
            data.tooltips = Localization.toText('storyPage-disableEditMode')
            data.icon = DisableEditIcon
        }
        else {
            data.tooltips = Localization.toText('storyPage-enableEditMode')
            data.icon = EnableEditIcon
        }
        return data;
    }, [location, editEnabled])
    
    return (
        <Link href={Navigation.EditModeURL(!editEnabled)}>
            <div 
                className={styles.editMode} 
                tooltips={data.tooltips}
            >
                <data.icon sx={{ height: "100%" }}/>
            </div>
        </Link>
    )
}

export default StoryPage;