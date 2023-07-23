import { useMemo } from 'react';
import { RollEvent, RollMethod } from 'types/dice';
import styles from 'styles/pages/storyPage/rollHistory.module.scss'

export type HistoryRollEntryProps = React.PropsWithRef<{
    entry: RollEvent
}>

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
            <div className={styles.entryTotal}>
                <b>{result.desc}: </b>
                <b>{Math.max(0, selected.sum + mod)}</b>
            </div>
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

export default HistoryRollEntry;