import React, { useContext, useMemo, useState } from 'react';
import Link from 'next/link';
import { Context } from 'components/contexts/storyContext';
import { D20Icon } from 'assets/dice';
import HomeIcon from '@mui/icons-material/HomeSharp';
import HistoryIcon from '@mui/icons-material/HistorySharp';
import Logo from '@mui/icons-material/MenuBookSharp';
import EnableEditIcon from '@mui/icons-material/EditSharp';
import DisableEditIcon from '@mui/icons-material/EditOffSharp';
import SettingsIcon from '@mui/icons-material/SettingsSharp';
import HelpIcon from '@mui/icons-material/QuestionMarkSharp';
import Divider from 'components/divider'
import FileView from './fileView';
import FileSystem from "./fileSystem/fileSystem";
import DicePanel from './dicePanel';
import RollHistoryPanel from './rollHistoryPanel';
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
 * 
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
 * @param {{ disabled: boolean }} 
 * @returns {JSX.Element}
 */
const RollHistoryButton = ({ disabled }) => {
    const [open, setOpen] = useState(false); 
    const [toggled, setToggled] = useState(false);
    const isOpen = (toggled || open) ? true : undefined;

    const HandleClick = () => setToggled((toggled) => !toggled);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    return (
        <div className={styles.holder} open={isOpen}>
            <div 
                className={styles.rollHistory}
                disabled={disabled ? true : undefined}
                tooltips={toggled 
                    ? Localization.toText('storyPage-closeRollHistoryMenu')
                    : Localization.toText('storyPage-openRollHistoryMenu')}
                onClick={HandleClick}
            >
                <HistoryIcon sx={{ height: "100%", width: "100%" }}/>
                { Localization.toText('storyPage-rollHistory')}
            </div>
            <RollHistoryPanel 
                open={handleOpen} 
                close={handleClose} 
                isOpen={toggled}
            />
        </div>
    )
}

const DiceButton = () => {
    const [open, setOpen] = useState(false); 

    return (
        <div className={styles.holder}>
            <div 
                className={styles.dice} 
                tooltips={open 
                    ? Localization.toText('storyPage-closeDiceMenu')
                    : Localization.toText('storyPage-openDiceMenu')}
                onClick={() => setOpen(!open)}
            >
                <D20Icon/>
            </div>
            { open && <DicePanel close={() => setOpen(false)}/> }
        </div>
    )
}

const HomeButton = () => {
    return (
        <Link href={Navigation.OriginURL()}>
            <div 
                className={styles.home} 
                tooltips={Localization.toText('storyPage-home')}
            >
                <HomeIcon sx={{ height: "100%" }}/>
            </div>
        </Link>
    )
}

/**
 * 
 * @param {{ editEnabled: boolean }} 
 * @returns {JSX.Element}
 */
const EditModeButton = ({ editEnabled }) => {
    const data = useMemo(() => {
        console.log("Update")
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

const SettingsButton = () => {
    return (
        <Link href={Navigation.SettingsURL()}>
            <div 
                className={styles.settings} 
                tooltips={Localization.toText('storyPage-openSettingsMenu')}
            >
                <SettingsIcon sx={{ height: "100%" }}/>
            </div>
        </Link>
    )
}

export default StoryPage;