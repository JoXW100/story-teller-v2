import { useMemo } from 'react';
import { RollEvent, RollMethod, RollResult } from 'types/dice';
import styles from 'styles/pages/storyPage/rollHistory.module.scss'

export type HistoryRollEntryProps = React.PropsWithRef<{
    entry: RollEvent
}>

type HistoryRollNoticeProps = React.PropsWithRef<{
    roll: RollResult
}>

const HistoryRollEntry = ({ entry }: HistoryRollEntryProps): JSX.Element => {
    const Content = useMemo(() => {
        let result = entry.result;
        let selected = result.results[result.selectedIndex];
        let mod = result.modifier;
        let noRolls = selected.sum === 0
        let modText = mod === 0 || noRolls ? null : mod < 0 
            ? `${selected.sum} - ${Math.abs(mod)} ⟶`
            : `${selected.sum} + ${mod} ⟶`;
        let content = result.results.map((res, index) => (
            <div key={index} data={result.selectedIndex === index ? 'true' : 'false'}>
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
                    <HistoryRollNotice roll={result}/>
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

const HistoryRollNotice = ({ roll }: HistoryRollNoticeProps): JSX.Element => {
    if (roll.method !== RollMethod.Crit 
     && roll.results.every(res => res.sum === 1 && res.values.length === 1 && res.values[0].dice.num === 20)) {
        return <b data='fail'>-FAIL</b>
    }

    if ((roll.method === RollMethod.Advantage || roll.method === RollMethod.Normal) 
     && roll.results.every(res => res.values.length === 1 && res.values[0].dice.num === 20)
     && roll.results.some(res => res.sum >= roll.criticalRange)) {
        return <b data='crit'>+CRIT</b>;
    }

    switch (roll.method) {
        case RollMethod.Disadvantage:
            if (roll.results.every(res => res.sum >= roll.criticalRange && res.values.length === 1 && res.values[0].dice.num === 20)) {
                return <b data='crit'>+CRIT</b>;
            } else {
                return <b data='dis'>-DIS</b>
            }
        case RollMethod.Advantage: return <b data='adv'>+ADV</b>
        case RollMethod.Crit: return <b data='crit'>+CRIT</b>;
        default: return null;
    }
}

export default HistoryRollEntry;