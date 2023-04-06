import { closePopup } from "./popupHolder";
import styles from 'styles/common/confirmationPopup.module.scss'

type ConfirmationPopupProps = React.PropsWithoutRef<{
    header: string
    options: string[]
    callback: (option: string) => void
}>

const ConfirmationPopup = ({ header, options = [], callback }: ConfirmationPopupProps): JSX.Element => {
    const handleClick = (option: string) => {
        callback(option)
        closePopup()
    }

    return (
        <div className={styles.main}>
            <div className={styles.header}> { header } </div>
            <div className={styles.body}> 
                { options?.map((option, index) => (
                    <div 
                        key={index}
                        className={styles.button} 
                        onClick={() => handleClick(option)}> 
                        {option} 
                    </div>
                ))}
            </div>
        </div>
    )
}   

export default ConfirmationPopup;