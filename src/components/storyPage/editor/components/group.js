import React, { useState } from 'react'
import styles from 'styles/storyPage/editor.module.scss'
import '@types/data';


/**
 * 
 * @param {{ children: JSX.Element, params: GroupParams }} 
 * @returns {JSX.Element}
 */
const GroupComponent = ({ children, params = { label: "None"} }) => {
    const [open, setOpen] = useState(params.open);

    return (
        <div className={styles.editGroup} fill={String(params.fill && open)}>
            <div 
                className={styles.editGroupHeader}
                open={open}
                onClick={() => setOpen(!open)}
            >
                {params.label}
            </div>
            { open && children }
        </div>
    )
}

export default GroupComponent;