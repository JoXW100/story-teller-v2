import React, { useContext, useEffect, useMemo, useState } from 'react'
import { Context } from 'components/contexts/fileContext';
import TextEditor from 'components/textEditor/simple-textEditor';
import styles from 'styles/storyPage/editor.module.scss'

/** @enum {number} */
const EditInputType = {
    Root: 'root',
    Group: 'group',
    Editor: 'editor',
    Text: 'text',
    Textarea: 'textarea',
    Integer: 'integer',
    Float: 'float',
    Enum: 'enum',
    Boolean: 'boolean'
}

/**
 * @template T
 * @typedef EditorTemplate<T>
 * @property {EditInputType} type
 * @property {T} params
 * @property {[EditorTemplate]} children
 */

/**
 * @typedef GroupTemplateParams
 * @property {string} label 
 * @property {boolean} open
 * @property {boolean} fill 
 */

/**
 * @typedef TextTemplateParams
 * @property {string} label 
 * @property {string} key
 */

/**
 * @typedef TextareaTemplateParams
 * @property {string} label 
 * @property {string} key
 */

/** @param {EditorTemplate<any>} template */
const BuildEditor = (template, key = 0) => {
    var Content = null;
    var children = template.children?.map((child, key) => BuildEditor(child, key));
    switch (template.type) {
        case EditInputType.Root:
            return <> { children } </>

        case EditInputType.Group:
            Content = EditGroup
            break;
        
        case EditInputType.Editor:
            Content = EditEditor
            break;

        case EditInputType.Text:
            Content = EditText;
            break;
            
        case EditInputType.Textarea:
            Content = EditTextarea;
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
            : (
                <div className={styles.empty}>
                    Select File to Edit
                </div>
            )
    }, [context.file])

    return (
        <div className={styles.main}>
           { content }
        </div>
    )
}

/**
 * 
 * @param {{ children: JSX.Element, params: GroupTemplateParams }} 
 * @returns {JSX.Element}
 */
const EditGroup = ({ children, params }) => {
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

/** @returns {JSX.Element} */
const EditEditor = () => {
    const [context, dispatch] = useContext(Context)

    /** @param {React.KeyboardEvent<HTMLElement>} e */
    const handleInput = (e) => {
        dispatch.setText(e.target.value);
    }

    return (
        <TextEditor 
            text={context.file?.content.text} 
            handleInput={handleInput}
        />
    )
}

/**
 * 
 * @param {{ children: JSX.Element, params: TextTemplateParams }} 
 * @returns {JSX.Element}
 */
const EditText = ({ params }) => {
    const [context, dispatch] = useContext(Context)
    const value = context.file?.content.metadata 
        ? context.file.content.metadata[params.key] ?? ''
        : '';

    /** @param {React.ChangeEvent<HTMLInputElement>} e */
    const handleInput = (e) => {
        dispatch.setMetadata(params.key, e.target.value);
    }

    return (
        <div className={styles.editText}>
            <b> {`${ params.label ?? "label"}:`} </b>
            <input value={value} onChange={handleInput}/>
        </div>
    )
}

/**
 * 
 * @param {{ children: JSX.Element, params: TextareaTemplateParams }} 
 * @returns {JSX.Element}
 */
const EditTextarea = ({ params }) => {
    const [context, dispatch] = useContext(Context)
    const value = context.file?.content.metadata 
        ? context.file.content.metadata[params.key] ?? ''
        : '';

    /** @param {React.ChangeEvent<HTMLInputElement>} e */
    const handleInput = (e) => {
        dispatch.setMetadata(params.key, e.target.value);
    }

    return (
        <div className={styles.editText}>
            <b> {`${params.label ?? "label"}:`} </b>
            <TextEditor text={value} handleInput={handleInput}/>
        </div>
    )
}

export default Editor;