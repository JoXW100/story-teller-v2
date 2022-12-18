import CheckIcon from '@mui/icons-material/CheckSharp';
import styles from 'styles/components/checkbox.module.scss';

/**
 * @param {{ 
 *  className: string,
 *  value: boolean,
 *  onChange: (value: boolean) => void
 * }} 
 * @returns {JSX.Element}
 */
const Checkbox = ({ className, value, onChange }) => {
    return (
        <span 
            className={className ? `${styles.main} ${className}` : styles.main}
            onClick={() => onChange(!value)}
        >
            { value ? <CheckIcon sx={{ height: '100%' }}/> : null }
        </span>
    )
}

export default Checkbox;