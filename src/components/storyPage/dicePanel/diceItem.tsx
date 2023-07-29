import Dice from 'utils/data/dice';
import styles from 'styles/pages/storyPage/dicePanel.module.scss';

type DiceItemProps = React.PropsWithRef<{
    dice: Dice
    num: number
    onClick: (dice: Dice) => void
}>

const DiceItem = ({ dice, num, onClick }: DiceItemProps): JSX.Element => {
    const Icon = dice.icon;
    return (
        <button
            className={styles.dice} 
            onClick={() => onClick(dice)}
            tooltips={dice.text}>
            <Icon/>
            {num > 0 && <div className={styles.number}>{num}</div>}
        </button>
    )
}

export default DiceItem;