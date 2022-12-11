import { useContext, useMemo, useState } from 'react';
import { Context } from 'components/contexts/storyContext';
import Dice from 'utils/data/dice';
import DiceCollection from 'utils/data/diceCollection';
import styles from 'styles/storyPage/dicePanel.module.scss';
import Localization from 'classes/localization';

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
            
            { state.collection.some((x) => x.num > 0) &&  (
                <div className={styles.rollBackground}> 
                    <div 
                        className={styles.roll}
                        tooltips={Localization.toText("storyPage-dicePanel-rollTooltips")}
                        onClick={handleRoll}
                    >
                        { Localization.toText("storyPage-dicePanel-roll") }
                    </div> 
                </div>
            )}
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