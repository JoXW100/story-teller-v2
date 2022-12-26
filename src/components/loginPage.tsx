import Link from 'next/link';
import LoginIcon from '@mui/icons-material/LoginSharp';
import Localization from 'utils/localization';
import styles from 'styles/loginPage.module.scss';

type LoginPageProps = React.PropsWithRef<{
    returnURL?: string
}>

const LoginPage = ({ returnURL }: LoginPageProps): JSX.Element => {
    const href = returnURL 
        ? `/api/auth/login?return=` + JSON.stringify({return: returnURL}) 
        : '/api/auth/login'
    return (
        <div className={styles.main}>
            <div className={styles.panel}>
                <div className={styles.header}> Login Required </div>
                <div className={styles.body}>
                    <Link href={href} passHref>
                        <div className={styles.loginButton}>
                            { Localization.toText('loginPage-prompt') }
                            <LoginIcon/>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default LoginPage;