import NumberInput from 'components/common/controls/numericInput';
import { useState } from 'react';
import styles from 'styles/renderer.module.scss';

type ChargesRendererProps = React.PropsWithRef<{
    charges: number
    expended: number
    setExpended: (expended: number) => void
}>

type ChargeProps = React.PropsWithRef<{
    expended: boolean
    setExpended: (value: boolean) => void
}>

export const ChargeToggle = ({ expended, setExpended }: ChargeProps): JSX.Element => {
    const handleClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
        e.stopPropagation()
        setExpended(!expended)
    }

    return (
        <div 
            className={styles.chargeToggle} 
            onClick={handleClick}
            data={expended ? 'active' : undefined}/>
    )
}

const ChargesRenderer = ({ charges, expended, setExpended }: ChargesRendererProps): JSX.Element => {
    const [state, setState] = useState(false)
    const handleSetValue = (value: number) => {
        setExpended(Math.max(0, Math.min(charges - value, charges)))
    }

    const handleFocusLost = () => {
        setState(false)
    }

    const handleClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
        e.stopPropagation()
        setState(true)
    }

    if (charges > 99) {
        return null
    } else if (charges > 5) {
        return (
            <div className={styles.chargeToggleInputHolder} onClick={handleClick}>
                { state 
                    ?
                    <>
                        <NumberInput 
                            value={charges - expended}
                            autoFocus={true}
                            setValue={handleSetValue}
                            onFocusLost={handleFocusLost}/>
                        <b>{` / ${charges}`}</b>
                    </>
                    :
                    <b>{`${charges - expended} / ${charges}`}</b>
                }
            </div>
        )
    } else if (charges > 0) {
        return (
            <>
                {Array.from({length: charges }, (_,i) => (
                    <ChargeToggle 
                        key={i} 
                        expended={i < expended} 
                        setExpended={(value) => setExpended(value ? i + 1 : i)}/>
                ))}
            </>
        )
    } else {
        return null
    }
}

export default ChargesRenderer;