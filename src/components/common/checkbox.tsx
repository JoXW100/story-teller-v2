import CheckIcon from '@mui/icons-material/CheckSharp';
import styles from 'styles/components/checkbox.module.scss';

type CheckboxProps = React.PropsWithRef<{
    className: string
    value: boolean
    onChange: (value: boolean) => void
}>

const Checkbox = ({ className, value, onChange }: CheckboxProps): JSX.Element => {
    const onClick = () => onChange(!value)
    const name = className ? `${styles.main} ${className}` : styles.main
    return (
        <span className={name} onClick={onClick}>
            { value ? <CheckIcon/> : null }
        </span>
    )
}

export default Checkbox;