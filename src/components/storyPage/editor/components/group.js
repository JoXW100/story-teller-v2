import React, { useState } from 'react'
import styles from 'styles/storyPage/editor.module.scss'
import '@types/editor';


/**
 * 
 * @param {{ children: JSX.Element, params: GroupTemplateParams }} 
 * @returns {JSX.Element}
 */
const GroupComponent = ({ children, params }) => {
    const [open, setOpen] = useState(params.open);
    
    return (
        <div className={styles.editGroup} fill={String(params.fill && open)}>
            <div 
                className={styles.editGroupHeader}
                onClick={() => setOpen(!open)}
            >
                {params.label}
            </div>
            { open && children }
        </div>
    )
}

export default GroupComponent;