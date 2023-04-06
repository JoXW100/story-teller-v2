import React, { useEffect, useState, useContext } from 'react';
import { Context } from 'components/contexts/storyContext';
import HistoryIcon from '@mui/icons-material/HistorySharp';
import RollHistoryPanel from './rollHistoryPanel';
import Localization from 'utils/localization';
import styles from 'styles/pages/storyPage/main.module.scss'

type RollHistoryButtonProps = React.PropsWithRef<{
    disabled: boolean
}>

const RollHistoryButton = ({ disabled }: RollHistoryButtonProps): JSX.Element => {
    const [_, dispatch] = useContext(Context);
    const [open, setOpen] = useState(false); 
    const [toggled, setToggled] = useState(false);
    const isOpen = toggled || open;

    const HandleClick = () => setToggled((toggled) => !toggled);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    useEffect(() => {
        if (open) {
            dispatch.clearRolls()
        }
    }, [toggled])

    return (
        <div
            data={isOpen ? "open" : "closed"}
            className={styles.holder}>
            <button 
                className={styles.headerButton}
                onClick={HandleClick}
                disabled={disabled ? true : undefined}
                tooltips={toggled 
                    ? Localization.toText('storyPage-closeRollHistoryMenu')
                    : Localization.toText('storyPage-openRollHistoryMenu')}
            >
                <HistoryIcon sx={{ height: "100%", width: "100%" }}/>
                { Localization.toText('storyPage-rollHistory')}
            </button>
            <RollHistoryPanel 
                open={handleOpen} 
                close={handleClose} 
                isOpen={toggled}/>
        </div>
    )
}

export default RollHistoryButton;