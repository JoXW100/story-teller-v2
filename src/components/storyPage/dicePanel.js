import { useState } from 'react';
import { D100Icon, D20Icon, D12Icon, D10Icon, D8Icon, D6Icon, D4Icon } from 'assets/dice';
import styles from 'styles/storyPage/dicePanel.module.scss'

/**
 * 
 * @param {{ }}
 * @returns {JSX.Element}
 */
const DicePanel = ({ close }) => {
    
    const [state, setState] = useState({
        '4': { num: 0, icon: D4Icon },
        '6': { num: 0, icon: D6Icon },
        '8': { num: 0, icon: D8Icon },
        '10': { num: 0, icon: D10Icon },
        '12': { num: 0, icon: D12Icon },
        '20': { num: 0, icon: D20Icon },
        '100': { num: 0, icon: D100Icon },
    });

    const handleClick = (dice, num) => {
        setState({ ...state, [dice]: { ...state[dice], num: num + 1 } })
    }

    const handleRoll = () => {
        // TODO: Roll
        close();
    }

    return (
        <div className={styles.holder}>
            <div className={styles.main}>
                {
                    Object.keys(state)
                        .sort((a, b) => b - a)
                        .map((key, index) => (
                        <DiceIcon 
                            key={index} 
                            text={key} 
                            num={state[key].num} 
                            icon={state[key].icon}
                            onClick={handleClick}
                        />
                    ))
                }
            </div>
            { Object.values(state).some((x) => x.num > 0) &&  (
                <div 
                    className={styles.roll}
                    onClick={handleRoll}
                    tooltips="Roll selected dice"
                > 
                    Roll 
                </div>
            )}
        </div>
    )
}

/**
 * @param {{ text: string, num: number, icon: JSX.Element }} 
 * @returns {JSX.Element}
 */
const DiceIcon = ({ text, num, icon, onClick }) => {
    const Icon = icon;
    return (
        <div
            className={styles.dice} 
            tooltips={`d${text}`}
            onClick={() => onClick(text, num)}
        >
            <Icon/>
            {num > 0 && <div className={styles.number}>{num}</div>}
        </div>
    )
}

export default DicePanel;