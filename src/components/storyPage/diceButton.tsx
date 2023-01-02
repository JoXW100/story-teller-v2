import React, { useState } from 'react';
import { D20Icon } from 'assets/dice';
import DicePanel from './dicePanel';
import Localization from 'utils/localization';
import styles from 'styles/storyPage/main.module.scss'

const DiceButton = (): JSX.Element => {
    const [open, setOpen] = useState(false); 

    return (
        <div className={styles.holder}>
            <button 
                className={styles.dice}
                onClick={() => setOpen(!open)}
                tooltips={open 
                    ? Localization.toText('storyPage-closeDiceMenu')
                    : Localization.toText('storyPage-openDiceMenu')}
                
            >
                <D20Icon/>
            </button>
            <DicePanel open={open}/>
        </div>
    )
}

export default DiceButton;