import { useContext, useEffect, useMemo, useState } from 'react';
import { Context } from 'components/contexts/storyContext';
import { RollEvent, RollMethod } from 'types/dice';
import styles from 'styles/storyPage/rollHistory.module.scss'

type RollHistoryPanelProps = React.PropsWithRef<{
    open: () => void
    close: () => void
    isOpen: boolean
}>

type HistoryRollEntryProps = React.PropsWithRef<{
    entry: RollEvent
}>

const RollHistoryPanel = ({ open, close, isOpen }: RollHistoryPanelProps): JSX.Element => {
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
            }, interval)
        }

        setState((state) => ({ ...state, active: res, interrupt: interrupt }));
    }, [context])

    useEffect(() => {
        if (state.active) {
            open();
        } else {
            close();
            clearInterval(state.interrupt);
        }
    }, [state.active])

    const date = Date.now()
    const display = isOpen || context.rollHistory.some((x) => date - x.time < duration)

    return (
        <div className={styles.main} data={String(display)}>
            { context.rollHistory
                .filter((x) => isOpen || date - x.time < duration)
                .map((entry, index) => (
                    <HistoryRollEntry key={index} entry={entry}/>
                )) 
            }
        </div>
    )
}

const HistoryRollEntry = ({ entry }: HistoryRollEntryProps): JSX.Element => {
    const Content = useMemo(() => {
        var result = entry.result;
        var selected = result.results[result.selectedIndex];
        var mod = result.modifier;
        var noRolls = selected.sum === 0
        var modText = mod === 0 || noRolls ? null : mod < 0 
            ? `${selected.sum} - ${Math.abs(mod)} ⟶`
            : `${selected.sum} + ${mod} ⟶`;
        var content = result.results.map((res, index) => (
            <div 
                key={index}
                data={result.selectedIndex === index ? 'true' : 'false'}
            >
                { res.values.map((res, key) => (
                    <div key={key}>
                        {`${res.num}${res.dice.text} ⟶ ${res.result.join(' ')}`}
                    </div>
                ))}
            </div>
        ));

        return noRolls 
        ? (
            <>
                <div className={styles.entryTotal}>
                    <b>{result.desc}: </b>
                    <b>{Math.max(0, selected.sum + mod)}</b>
                </div>
            </>
        ) : (
            <>
                <div className={styles.entryHeader}>
                    <b>{result.desc}: </b>
                    { result.method === RollMethod.Advantage && <b data='adv'>+ADV</b> } 
                    { result.method === RollMethod.Disadvantage && <b data='dis'>-DIS</b> }
                    { result.method === RollMethod.Crit && <b data='crit'>+CRIT</b> }
                </div>
                <div className={styles.entryContent}>
                    { content }
                </div>
                <div className={styles.entryTotal}>
                    <b> Total: </b>
                    { modText && <span>{modText}</span>}
                    <b>{Math.max(0, selected.sum + mod)}</b>
                </div>
            </>
        )
    }, [entry])

    return (
        <div className={styles.entry}>
            { Content }
        </div>
    )
}

export default RollHistoryPanel;