import LoginIcon from '@mui/icons-material/LoginSharp';
import styles from 'styles/loginPage/main.module.scss';

const LoginPage = () => {

    return (
        <div className={styles.main}>
            <div className={styles.panel}>
                <div className={styles.header}> Login Required </div>
                <div className={styles.body}>
                    <a 
                        className={styles.logoutButton}
                        href="/api/auth/login"
                    >
                        Login
                        <LoginIcon/>
                    </a>
                </div>
            </div>
        </div>
    )
}

export default LoginPage;