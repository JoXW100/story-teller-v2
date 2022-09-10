import { useContext, useMemo, useState } from 'react';
import { Context } from 'components/contexts/storyContext';
import Dice from 'utils/data/dice';
import DiceCollection from 'utils/data/diceCollection';
import styles from 'styles/storyPage/dicePanel.module.scss';

/**
 * 
 * @returns {JSX.Element}
 */
const DicePanel = () => {
    const [_, dispatch] = useContext(Context);
    const [state, setState] = useState({ collection: new DiceCollection() });
    const dice = [new Dice(100), new Dice(20), new Dice(12), new Dice(10), new Dice(8), new Dice(6), new Dice(4)];

    const handleClick = (dice) => {
        state.collection.add(dice, 1);
        setState({ ...state })
    }

    const handleRoll = () => {
        dispatch.roll(state.collection)
        setState({ ...state, collection: new DiceCollection() })
    }

    return (
        <div className={styles.holder}>
            <div className={styles.main}>
                {
                    dice.map((dice, index) => (
                        <DiceItem 
                            key={index} 
                            dice={dice} 
                            num={state.collection.getNum(dice)} 
                            onClick={handleClick}
                        />
                    ))
                }
            </div>
            { state.collection.some((x) => x.num > 0) &&  (
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
 * @param {{ dice: Dice, num: number, onClick: (dice: Dice) => void }} 
 * @returns {JSX.Element}
 */
const DiceItem = ({ dice, num, onClick }) => {
    const Icon = dice.icon;
    return (
        <div
            className={styles.dice} 
            tooltips={dice.text}
            onClick={() => onClick(dice)}
        >
            <Icon/>
            {num > 0 && <div className={styles.number}>{num}</div>}
        </div>
    )
}

export default DicePanel;