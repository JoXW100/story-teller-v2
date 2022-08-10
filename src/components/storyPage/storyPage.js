import React, { useContext, useState } from 'react';
import { useRouter } from 'next/router';
import { Context as StoryContext } from 'components/contexts/storyContext';
import { D20Icon } from 'assets/dice';
import RecompileIcon from '@mui/icons-material/CachedSharp';
import HomeIcon from '@mui/icons-material/HomeSharp';
import Logo from '@mui/icons-material/MenuBookSharp';
import Divider from 'components/divider'
import FileView from './fileView';
import FileSystem from "./fileSystem/fileSystem";
import styles from 'styles/storyPage/main.module.scss'
import Localization from 'classes/localization';
import '@types/fileContext'
import DicePanel from './dicePanel';

/**
 * @returns {JSX.Element}
 */
const StoryPage = () => {
    return (
        <div className={styles.main}>
            <div className={styles.header}>
                <StoryName/>
                <div className={styles.headerMenu}>
                    <RecompileButton/>
                    <DiceButton/>
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

const StoryName = () => {
    const [context] = useContext(StoryContext);
    return (
        <div className={styles.name}>
            <Logo sx={{ height: "100%", margin: "0 5px 0 0" }}/>
            { context.story.name }
        </div>
    )
}

const RecompileButton = () => {
    return (
        <div className={styles.recompile} disabled>
            <RecompileIcon sx={{ height: "100%", margin: "0 5px 0 0" }}/>
            { Localization.toText('storyPage-recompile')}
        </div>
    )
}

const DiceButton = () => {
    const [open, setOpen] = useState(false); 

    return (
        <div className={styles.diceHolder}>
            <div 
                className={styles.dice} 
                tooltips={open ? "Close dice menu" : "Open dice menu"}
                onClick={() => setOpen(!open)}
            >
                <D20Icon/>
            </div>
            { open && <DicePanel close={() => setOpen(false)}/> }
        </div>
    )
}

const HomeButton = () => {
    const router = useRouter()
    return (
        <div 
            className={styles.home} 
            tooltips="Back to select story"
            onClick={() => router.push('../.')}
        >
            <HomeIcon sx={{ height: "100%" }}/>
        </div>
    )
}


export default StoryPage