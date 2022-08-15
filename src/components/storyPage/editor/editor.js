import React, { useContext, useEffect, useMemo } from 'react'
import { Context } from 'components/contexts/fileContext';
import { EditInputType } from '@enums/editor';
import Components from './components';
import styles from 'styles/storyPage/editor.module.scss'
import '@types/editor';


/** @param {EditorTemplate<any>} template */
const BuildEditor = (template, key = 0) => {
    var Content = null;
    var children = template.children?.map((child, key) => BuildEditor(child, key));
    switch (template.type) {
        case EditInputType.Root:
            return <> { children } </>

        case EditInputType.Group:
            Content = Components.Group
            break;
        
        case EditInputType.Editor:
            Content = Components.Editor
            break;

        case EditInputType.Text:
            Content = Components.Text;
            break;
            
        case EditInputType.Textarea:
            Content = Components.Textarea;
            break;
    
        default:
            break;
    }

    return Content && (
        <Content key={key} params={template.params}> 
            { children }
        </Content>
    )
}

/**
 * 
 * @returns {JSX.Element} 
 */
const Editor = () => {
    const [context] = useContext(Context)

    // Prevent leaving page with unsaved changes
    useEffect(() => {
        if (window) {
            window.onbeforeunload = (e) => {
                if (context.queue.requestIsQueued) {
                    e.preventDefault();
                    e.returnValue = "";
                }
            };
        }
        
        return () => {
            if (window) {
                window.onbeforeunload = null;
            }
        }
    }, [])

    const content = useMemo(() => {
        /** @type {EditorTemplate<T>} */
        const template = require('data/editorTemplates/doc.json')
        return context.file
            ? BuildEditor(template)
            : null
    }, [context.file])

    return (
        <div className={styles.main}>
           { content }
        </div>
    )
}

export default Editor;