import { useContext, useEffect, useMemo, useState } from 'react';
import { Context } from 'components/contexts/storyContext';
import { RollMethod } from '@enums/data';
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
 * @param {{ entry: { result: RollResult, time: number } }} 
 * @returns {JSX.Element}
 */
const HistoryRollEntry = ({ entry }) => {
    
    
    const Content = useMemo(() => {
        var result = entry.result;
        var selected = result.results[result.selectedIndex];
        var mod = result.modifier;
        var modText = mod === 0 ? null :  mod < 0 
            ? `${selected.sum} - ${Math.abs(mod)} ⟶`
            : `${selected.sum} + ${mod} ⟶`;
        
        var content = result.results.map((res, index) => (
            <div key={index} chosen={(result.selectedIndex === index).toString()}>
                { res.values.map((res, key) => (
                    <div key={key}>
                        {`${res.num}${res.dice.text} ⟶ ${res.result}`}
                    </div>
                ))}
            </div>
        ));

        return <>
            <div className={styles.entryHeader}>
                <b>Rolled: </b> 
                { result.method === RollMethod.Advantage && <b type='adv'>+ADV</b> }
                { result.method === RollMethod.Disadvantage && <b type='dis'>-DIS</b> }
            </div>
            <div className={styles.entryContent}>
                { content }
            </div>
            <div className={styles.entryTotal}>
                <b> Total: </b>
                { modText && <span>{modText}</span>}
                <b> {Math.max(0, selected.sum + mod)} </b>
            </div>
        </>
    }, [entry])

    return (
        <div className={styles.entry}>
            { Content }
        </div>
    )
}

export default RollHistoryPanel;