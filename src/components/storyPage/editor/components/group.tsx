import React, { useState } from 'react'
import { TemplateComponentProps } from '.';
import { GroupTemplateParams } from 'types/templates';
import styles from 'styles/pages/storyPage/editor.module.scss'

const GroupComponent = ({ children, params }: TemplateComponentProps<GroupTemplateParams>): JSX.Element => {
    const [open, setOpen] = useState(params.open);

    return (
        <div 
            className={styles.editGroup}
            data={params.fill && open ? "fill" : "default"}>
            <button 
                className={styles.editGroupHeader}
                onClick={() => setOpen(!open)}
                data={open ? "open" : "closed"}>
                <span>{params.label ?? "Missing Label"}</span>
            </button>
            { open && children }
        </div>
    )
}

export default GroupComponent;