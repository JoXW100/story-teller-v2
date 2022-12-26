import React, { useState } from 'react'
import { GroupTemplateParams } from 'types/templates';
import styles from 'styles/storyPage/editor.module.scss'

type GroupComponentProps = React.PropsWithChildren<{
    params: GroupTemplateParams
}>

const GroupComponent = ({ children, params }: GroupComponentProps): JSX.Element => {
    const [open, setOpen] = useState(params.open);

    return (
        <div 
            className={styles.editGroup} 
            // @ts-ignore
            fill={String(params.fill && open)}
        >
            <div 
                className={styles.editGroupHeader}
                onClick={() => setOpen(!open)}
                // @ts-ignore
                open={open}
            >
                {params.label ?? "Missing Label"}
            </div>
            { open && children }
        </div>
    )
}

export default GroupComponent;