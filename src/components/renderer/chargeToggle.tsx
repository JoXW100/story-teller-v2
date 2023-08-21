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

export const ChargeToggle = ({ expended, setExpended }: ChargeProps): JSX.Element => (
    <div 
        className={styles.chargeToggle} 
        onClick={() => setExpended(!expended)}
        data={expended ? 'active' : undefined}/>
)

const ChargesRenderer = ({ charges, expended, setExpended }: ChargesRendererProps): JSX.Element => {
    if (charges > 5) {
        return null
    } else if (charges > 0) {
        return (
            <>
                { Array.from({length: charges }, (_,i) => (
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