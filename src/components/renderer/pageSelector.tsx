import styles from 'styles/renderer.module.scss';

type PageSelectorProps = React.PropsWithRef<{
    pages: string[]
    page: string
    setPage: (page: string) => void
}>

const PageSelector = ({ pages, page, setPage }: PageSelectorProps) => {
    return (
        <div className={styles.pageSelector}>
            { Object.values(pages).filter(x => x !== null).map((p, index) => (
                <button key={index} disabled={page === p} onClick={() => setPage(p)}>
                    {p}
                </button>
            ))}
        </div>
    )
}

export default PageSelector