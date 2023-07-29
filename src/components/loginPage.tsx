import Link from 'next/link';
import LoginIcon from '@mui/icons-material/LoginSharp';
import Localization from 'utils/localization';
import styles from 'styles/pages/loginPage.module.scss';
import Navigation from 'utils/navigation';

type LoginPageProps = React.PropsWithRef<{
    returnURL?: string
}>

const LoginPage = ({ returnURL }: LoginPageProps): JSX.Element => {
    return (
        <div className={styles.main}>
            <div className={styles.header}> Login Required </div>
            <Link className={styles.loginButton} href={Navigation.loginAPI()} passHref>
                <button>
                    <label>{ Localization.toText('loginPage-prompt') }</label>
                    <LoginIcon/>
                </button>
            </Link>
        </div>
    )
}

export default LoginPage;