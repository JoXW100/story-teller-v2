import { useState } from "react"
import Localization from "utils/localization"
import styles from 'styles/renderer.module.scss';


type CollapsibleGroupProps = React.PropsWithChildren<{
    header: React.ReactNode
}>

const CollapsibleGroup = ({ header, children }: CollapsibleGroupProps): JSX.Element => {
    const [open, setOpen] = useState(true)
    const tooltips = open 
        ? Localization.toText('common-collapse')
        : Localization.toText('common-expand')
    return <>
        { header && (
            <div className={styles.collapsibleGroup} data={open ? "open" : "closed"}>
                <button 
                    onClick={() => setOpen(!open)}
                    tooltips={tooltips}>
                    {header}
                </button>
            </div>
        )}
        { open && children }
    </>
}

export default CollapsibleGroup