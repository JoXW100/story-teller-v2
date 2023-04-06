import { useContext, useState } from 'react';
import { Context } from 'components/contexts/storyContext';
import Dice from 'utils/data/dice';
import DiceCollection from 'utils/data/diceCollection';
import Localization from 'utils/localization';
import styles from 'styles/pages/storyPage/dicePanel.module.scss';

type DicePanelProps = React.PropsWithRef<{ open: boolean }>

type DiceItemProps = React.PropsWithRef<{
    dice: Dice
    num: number
    onClick: (dice: Dice) => void
}>

const DiceOptions = [
    new Dice(100), 
    new Dice(20), 
    new Dice(12), 
    new Dice(10), 
    new Dice(8), 
    new Dice(6), 
    new Dice(4)
];

const DicePanel = ({ open }: DicePanelProps): JSX.Element => {
    const [_, dispatch] = useContext(Context);
    const [state, setState] = useState({ collection: new DiceCollection() });
    
    const handleClick = (dice: Dice) => {
        state.collection.add(dice, 1);
        setState({ ...state })
    }

    const handleRoll = () => {
        dispatch.roll(state.collection)
        setState({ ...state, collection: new DiceCollection() })
    }

    return (
        <div className={styles.holder} data={String(open)}>
            { state.collection.some((x) => x.num > 0) &&  (
                <div className={styles.rollBackground}> 
                    <div 
                        className={styles.roll}
                        onClick={handleRoll}
                        tooltips={Localization.toText("storyPage-dicePanel-rollTooltips")}>
                        { Localization.toText("storyPage-dicePanel-roll") }
                    </div> 
                </div>
            )}
            <div className={styles.main}>
                { DiceOptions.map((dice, index) => (
                    <DiceItem 
                        key={index} 
                        dice={dice} 
                        num={state.collection.getNum(dice)} 
                        onClick={handleClick}/>
                ))}
            </div>
        </div>
    )
}

const DiceItem = ({ dice, num, onClick }: DiceItemProps): JSX.Element => {
    const Icon = dice.icon;
    return (
        <div
            className={styles.dice} 
            onClick={() => onClick(dice)}
            tooltips={dice.text}>
            <Icon/>
            {num > 0 && <div className={styles.number}>{num}</div>}
        </div>
    )
}

export default DicePanel;