import CheckIcon from '@mui/icons-material/CheckSharp';
import styles from 'styles/components/checkbox.module.scss';

type CheckboxProps = React.PropsWithRef<{
    className?: string
    value: boolean
    onChange: (newValue: boolean) => void
}>

const Checkbox = ({ className, value, onChange }: CheckboxProps): JSX.Element => {
    const onClick = () => onChange(!value)
    const name = className ? `${styles.main} ${className}` : styles.main
    return (
        <button className={name} data={value ? "true" : "false"} onClick={onClick}>
            <CheckIcon/>
        </button>
    )
}

export default Checkbox;