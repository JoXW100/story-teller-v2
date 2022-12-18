import React, { useState } from 'react';
import { D20Icon } from 'assets/dice';
import DicePanel from './dicePanel';
import Localization from 'classes/localization';
import styles from 'styles/storyPage/main.module.scss'

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

export default DiceButton;