import { useValidation } from 'utils/handlers/handleUser'
import SettingsPage from 'components/settingsPage';

type PageProps = {
    return?: string
}

const Page = ({ props }: { props: PageProps }): JSX.Element => {
    const valid = useValidation();
    return valid && <SettingsPage returnURL={props?.return ?? ''}/>
}

export default Page;