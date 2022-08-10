import { closePopup } from "components/popupHolder";
import styles from 'styles/common/confirmationPopup.module.scss'


/**
 * @param {{ header: string, options: [string], callback: (option: string) => void }}
 * @returns {JSX.Element}
 */
const ConfirmationPopup = ({ header, options, callback }) => {
    const handleClick = (option) => {
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
                        onClick={() => handleClick(option)}
                    > 
                        {option} 
                    </div>
                ))}
            </div>
        </div>
    )
}

export default ConfirmationPopup;