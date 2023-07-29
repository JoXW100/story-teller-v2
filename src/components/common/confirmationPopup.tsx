import { closePopup } from "./popupHolder";
import styles from 'styles/common/confirmationPopup.module.scss'

type ConfirmationPopupProps = React.PropsWithoutRef<{
    header: string
    description: string
    options: string[]
    callback: (option: string) => void
}>

const ConfirmationPopup = ({ header, description, options = [], callback }: ConfirmationPopupProps): JSX.Element => {
    const handleClick = (option: string) => {
        callback(option)
        closePopup()
    }

    return (
        <div className={styles.main}>
            <div className={styles.header}>{header}</div>
            <div className={styles.body}>{description}</div>
            <div className={styles.buttons}>
                { options?.map((option, index) => (
                    <button key={index} onClick={() => handleClick(option)}> 
                        {option} 
                    </button>
                ))}
            </div>
        </div>
    )
}   

export default ConfirmationPopup;