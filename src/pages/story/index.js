import { useRouter } from 'next/router'

/**
 * @returns {JSX.Element}
 */
const Page = () => {
    const router = useRouter()
    router.push('./')
    return null
}

export default Page;