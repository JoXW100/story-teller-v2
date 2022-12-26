import HomePage from 'components/homePage'
import { useValidation } from 'utils/handlers/handleUser';

const Page = ({ props }: { props: string[] }): JSX.Element => {
    const valid = useValidation();
    return valid && <HomePage/>
}

export default Page;