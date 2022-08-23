import React, { useContext, useEffect, useMemo } from 'react'
import { Context } from 'components/contexts/fileContext';
import { EditInputType } from '@enums/data';
import Components from './components';
import styles from 'styles/storyPage/editor.module.scss'
import '@types/data';

/** 
 * @param {{ type: string, value: any }} condition
 * @param {{ metadata: Object<string, any>, mode: string, cmp: any }} data
*/
const handleCondition = (condition, data) => {
    if (typeof condition === "string")
        return handleCondition({ type: "value", value: condition }, data)
    switch (condition.type) {
        case "equals":
            var params = { ...data, cmp: "$empty", mode: "equals" };
            return condition.value?.every((x) => handleCondition(x, params)) ?? false;
        case "notEquals":
            var params = { ...data, cmp: "$empty", mode: "notEquals" };
            return condition.value?.every((x) => handleCondition(x, params)) ?? false;
        case "metadata": 
            if (data.cmp === "$empty") {
                data.cmp = data.metadata[condition.value];
                return true;
            }
            if (data.mode === "equals")
                return data.metadata[condition.value] == data.cmp
            if (data.mode === "notEquals")
                return data.metadata[condition.value] != data.cmp
            return false;
        case "value": 
            if (data.cmp === "$empty"){
                data.cmp = condition.value;
                return true;
            }
            if (data.mode === "equals")
                return condition.value == data.cmp
            if (data.mode === "notEquals")
                return condition.value != data.cmp
            return false;
        case "any":
            return condition.value?.some((x) => handleCondition(x, data)) ?? false;
        case "all":
            return condition.value?.every((x) => handleCondition(x, data)) ?? false;
        default:
            return true;
    }
}

/** 
 * @param {EditorTemplate<any>} template 
 * @param {Object<string, any>} metadata 
 */
const checkConditions = (template, metadata = {}) => {
    const data = { metadata: metadata }
    return template.conditions?.every((c) => handleCondition(c, data) ) ?? true
}


/** @param {EditorTemplate<any>} template */
const buildEditor = (template, metadata, key = 0) => {
    if (!checkConditions(template, metadata))
        return null;

    var Content = null;
    var content = template.content?.map((item, key) => buildEditor(item, metadata, key));
    switch (template.type) {
        case EditInputType.Root:
            return <> { content } </>

        case EditInputType.Boolean:
            Content = Components.Boolean;
            break;

        case EditInputType.Group:
            Content = Components.Group
            break;
        
        case EditInputType.Editor:
            Content = Components.Editor
            break;

        case EditInputType.Text:
            Content = Components.Text;
            break;

        case EditInputType.Enum:
            Content = Components.Enum;
            break;
            
        case EditInputType.Textarea:
            Content = Components.Textarea;
            break;
              
        case EditInputType.List:
            Content = Components.List;
            break;

        case EditInputType.Selection:
            Content = Components.Selection;
            break;
        
        case EditInputType.Option:
            Content = Components.Option;
            break;

        case EditInputType.Number:
            Content = Components.Number;
            break;
    
        default:
            break;
    }

    return Content && (
        <Content key={key} params={template.params}> 
            { content }
        </Content>
    )
}

/**
 *  @param {{ template: EditorTemplate<any> }}
 * @returns {JSX.Element} 
 */
const Editor = ({ template }) => {
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
        /** @type {{ editor: EditorTemplate<T> }} */
        return context.file
            ? buildEditor(template, context.file.metadata)
            : null
    }, [context.file, template])

    return (
        <div className={styles.main}>
           { content }
        </div>
    )
}

export default Editor;