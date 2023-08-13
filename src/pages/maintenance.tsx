import MaintenancePage from 'components/maintenance';

type PageProps = {
    return?: string
}

const Page = ({ props }: { props: PageProps }): JSX.Element => {    
    return <MaintenancePage returnURL={props?.return}/>
}

export default Page;