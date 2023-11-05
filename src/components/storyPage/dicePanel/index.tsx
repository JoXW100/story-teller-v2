import { useContext, useState } from 'react';
import { Context } from 'components/contexts/storyContext';
import Dice from 'utils/data/dice';
import DiceCollection from 'utils/data/diceCollection';
import Localization from 'utils/localization';
import styles from 'styles/pages/storyPage/dicePanel.module.scss';
import DiceItem from './diceItem';
import { RollMethod } from 'types/dice';

type DicePanelProps = React.PropsWithRef<{ open: boolean }>

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
        state.collection.add(dice);
        setState({ ...state })
    }

    const handleRoll = () => {
        dispatch.roll(state.collection, null)
        setState({ ...state, collection: new DiceCollection() })
    }

    return (
        <div className={styles.holder} data={String(open)}>
            { state.collection.some((x) => x.num > 0) &&  (
                <div className={styles.rollBackground}> 
                    <button 
                        className={styles.roll}
                        onClick={handleRoll}
                        tooltips={Localization.toText("storyPage-dicePanel-rollTooltips")}>
                        { Localization.toText("storyPage-dicePanel-roll") }
                    </button> 
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

export default DicePanel;