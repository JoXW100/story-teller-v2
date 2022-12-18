import React, { useState } from 'react';
import HistoryIcon from '@mui/icons-material/HistorySharp';
import RollHistoryPanel from './rollHistoryPanel';
import Localization from 'classes/localization';
import styles from 'styles/storyPage/main.module.scss'

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

export default RollHistoryButton;