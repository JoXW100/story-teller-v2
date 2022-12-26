import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@auth0/nextjs-auth0';
import LoginPage from 'components/loginPage';

type PageProps = {
    return?: string
}

const Page = ({ props }: { props: PageProps }): JSX.Element => {
    const router = useRouter();
    const { user, isLoading } = useUser();

    useEffect(() => {
        if (user && !isLoading)
            router.push('../')
    }, [user, isLoading, router])

    return !isLoading && <LoginPage returnURL={props?.return}/>
}

export default Page;