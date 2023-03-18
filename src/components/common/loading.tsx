import LoopIcon from '@mui/icons-material/Loop';
import styles from 'styles/components/loading.module.scss'

type LoadingProps = React.PropsWithoutRef<{
    className?: string
}>

const Loading = ({ className }: LoadingProps): JSX.Element => {
    const name = className ? `${styles.main} ${className}` : styles.main
    return (
        <div className={name}>
            <LoopIcon/>
        </div>
    )
}

export default Loading