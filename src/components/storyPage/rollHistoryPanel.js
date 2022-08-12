import { useCallback, useContext, useEffect, useState } from 'react';
import { Context } from 'components/contexts/storyContext';
import styles from 'styles/storyPage/rollHistory.module.scss'

/**
 * @param {{ open: () => void, close: () => void, isOpen: boolean }}  
 * @returns {JSX.Element}
 */
const RollHistoryPanel = ({ open, close, isOpen }) => {
    const [context] = useContext(Context);
    const [state, setState] = useState({ active: false, interrupt: null });

    const duration = 10 * 1000; // 20 sec
    const interval = 200; // 200 ms

    useEffect(() => {
        var res = context.rollHistory.some(x => Date.now() - x.time < duration);
        var interrupt = null;

        if (res) {
            interrupt = setInterval(() => {
                var res = context.rollHistory.some(x => Date.now() - x.time < duration);
                setState((state) => ({ ...state, active: res }))
            }, [interval])
        }

        setState((state) => ({ ...state, active: res, interrupt: interrupt }));
    }, [context])

    useEffect(() => {
        if (state.active) {
            open();
        }
        else {
            close();
            clearInterval(state.interrupt);
        }
    }, [state.active])

    return (
        <div className={styles.main}>
            { context.rollHistory
                .filter((x) => isOpen || Date.now() - x.time < duration)
                .sort((a, b) => b.time - a.time)
                .map((entry, index) => (
                    <HistoryRollEntry key={index} entry={entry}/>
                )) 
            }
        </div>
    )
}

/**
 * 
 * @param {{ entry: { result: RollResult, mod: number time: number } }} 
 * @returns {JSX.Element}
 */
const HistoryRollEntry = ({ entry }) => {
    const sum = entry.result
        .flatMap(x => x.result)
        .reduce((sum, val) => sum + val, 0);

    const modText = entry.mod === 0 ? '' 
        :  entry.mod < 0 
        ? `- ${Math.abs(entry.mod)} ⟶ ${Math.max(sum + entry.mod, 0)}`
        : `+ ${entry.mod} ⟶ ${Math.max(sum + entry.mod, 0)}`;

    return (
        <div className={styles.entry}>
            <b>Rolled:</b> 
            { entry.result.map((res, key) => (
                <div key={key}>
                    {`${res.num}${res.dice.text} ⟶ ${res.result}`}
                </div>
            ))}
            {`Total: ${sum} ${modText}`}
        </div>
    )
}

export default RollHistoryPanel;