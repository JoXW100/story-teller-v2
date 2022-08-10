import LoopIcon from '@mui/icons-material/Loop';
import styles from 'styles/components/loading.module.scss'

/**
 * 
 * @param {{ className: String }} 
 * @returns { JSX.Element }
 */
const Loading = ({ className = '', color = 'black' }) => {

    return (
        <div className={styles.main + ' ' + className}>
            <LoopIcon 
                sx={{ width: "100%", height: "100%", color: color }}
            />
        </div>
    )
}

export default Loading