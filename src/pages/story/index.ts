import { useRouter } from 'next/router'

const Page = (): JSX.Element => {
    const router = useRouter()
    router.push('./')
    return null
}

export default Page;