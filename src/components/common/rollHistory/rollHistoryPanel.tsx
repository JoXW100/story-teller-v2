import { useContext, useEffect, useState } from 'react';
import { Context } from 'components/contexts/storyContext';
import styles from 'styles/pages/storyPage/rollHistory.module.scss'
import HistoryRollEntry from './rollHistoryEntry';

type RollHistoryPanelProps = React.PropsWithRef<{
    open: () => void
    close: () => void
    isOpen: boolean
}>

const RollHistoryPanel = ({ open, close, isOpen }: RollHistoryPanelProps): JSX.Element => {
    const [context] = useContext(Context);
    const [state, setState] = useState({ active: false, interrupt: null });

    const duration = 10 * 1000; // 20 sec
    const interval = 200; // 200 ms

    useEffect(() => {
        let res = context.rollHistory.some(x => Date.now() - x.time < duration);
        let interrupt = null;

        if (res) {
            interrupt = setInterval(() => {
                let res = context.rollHistory.some(x => Date.now() - x.time < duration);
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
                .reverse().map((entry, index) => 
                    <HistoryRollEntry key={index} entry={entry}/>
                ) 
            }
        </div>
    )
}

export default RollHistoryPanel;