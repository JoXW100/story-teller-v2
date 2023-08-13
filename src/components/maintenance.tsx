import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Communication from 'utils/communication';
import Localization from 'utils/localization';
import styles from 'styles/pages/maintenancePage.module.scss';

type LoginPageProps = React.PropsWithRef<{
    returnURL?: string
}>

const MaintenancePage = ({ returnURL }: LoginPageProps): JSX.Element => {
    const router = useRouter();

    useEffect(() => {
        Communication.getServerMode()
        .then(mode => mode !== "maintenance" && router.push('../'))
    }, [router?.pathname])

    return (
        <div className={styles.main}>
            <div className={styles.header}> 
                {Localization.toText('maintenancePage-header')}
            </div>
        </div>
    )
}

export default MaintenancePage;