import React, { useContext, useEffect, useMemo } from 'react'
import { Context } from 'components/contexts/fileContext';
import Components from './components';
import { AllTemplateCondition, AnyTemplateCondition, EditInputType, EqualsTemplateCondition, MetadataTemplateCondition, NotEqualsTemplateCondition, RootTemplateComponent, TemplateComponent, TemplateCondition, TemplateConditionType, ValueTemplateCondition } from 'types/templates';
import { FileMetadata } from 'types/database/files';
import styles from 'styles/storyPage/editor.module.scss'
import Loading from 'components/common/loading';

type EditorProps = React.PropsWithRef<{
    template: RootTemplateComponent
}>

interface ConditionsData {
    metadata: FileMetadata
    mode?: string
    cmp?: string | number | boolean
}

const handleCondition = (condition: TemplateCondition | string | boolean, data: ConditionsData) => {
    try {
        if (typeof condition === "string" || typeof condition === "boolean" || condition == null)
            return handleCondition({ type: TemplateConditionType.Value, value: condition }, data)
        switch (condition.type) {
            case TemplateConditionType.Equals:
                var params = { ...data, cmp: "$empty", mode: "equals" };
                return (condition as EqualsTemplateCondition)
                    .value?.every((x) => handleCondition(x, params)) ?? false;
            case TemplateConditionType.NotEquals:
                var params = { ...data, cmp: "$empty", mode: "notEquals" };
                return (condition as NotEqualsTemplateCondition)
                    .value?.every((x) => handleCondition(x, params)) ?? false;
            case TemplateConditionType.Metadata:
                if (data.cmp === "$empty") {
                    data.cmp = data.metadata[(condition as MetadataTemplateCondition).value];
                    return true;
                }
                if (data.mode === "equals")
                    return data.metadata[(condition as MetadataTemplateCondition).value] == data.cmp
                if (data.mode === "notEquals")
                    return data.metadata[(condition as MetadataTemplateCondition).value] != data.cmp
                return false;
            case TemplateConditionType.Value: 
                if (data.cmp === "$empty"){
                    data.cmp = (condition as ValueTemplateCondition).value;
                    return true;
                }
                if (data.mode === "equals")
                    return (condition as ValueTemplateCondition).value == data.cmp
                if (data.mode === "notEquals")
                    return (condition as ValueTemplateCondition).value != data.cmp
                return false;
            case TemplateConditionType.Any:
                return (condition as AnyTemplateCondition)
                    .value?.some((x) => handleCondition(x, data)) ?? false;
            case TemplateConditionType.All:
                return (condition as AllTemplateCondition)
                    .value?.every((x) => handleCondition(x, data)) ?? false;
            default:
                return true;
        }
    } catch (error) {
        console.error(error)
        return false
    }
}

const checkConditions = (template: TemplateComponent, metadata: FileMetadata): boolean => {
    var data = { metadata: metadata }
    return template.conditions?.every((c) => handleCondition(c, data) ) ?? true
}

export const buildEditor = (template: TemplateComponent, metadata: FileMetadata = {}, key = 0): JSX.Element => {
    if (!checkConditions(template, metadata))
        return null;
    var Component = null;
    var content = template.content?.map((item, key) => buildEditor(item, metadata, key));
    switch (template.type) {
        case EditInputType.Root:
            return <> { content } </>
        case EditInputType.Boolean:
            Component = Components.Boolean;
            break;
        case EditInputType.Group:
            Component = Components.Group
            break;
        case EditInputType.Editor:
            Component = Components.Editor
            break;
        case EditInputType.Text:
            Component = Components.Text;
            break;
        case EditInputType.Enum:
            Component = Components.Enum;
            break;
        case EditInputType.Textarea:
            Component = Components.Textarea;
            break;
        case EditInputType.List:
            Component = Components.List;
            break;
        case EditInputType.Selection:
            Component = Components.Selection;
            break;
        case EditInputType.Option:
            Component = Components.Option;
            break;
        case EditInputType.Number:
            Component = Components.Number;
            break;
        default:
            return null;
    }

    return Component && (
        <Component key={key} params={template.params}> 
            { content }
        </Component>
    )
}

const Editor = ({ template }: EditorProps): JSX.Element => {
    const [context] = useContext(Context)

    // Prevent leaving page with unsaved changes
    useEffect(() => {
        if (window) {
            window.onbeforeunload = (e : BeforeUnloadEvent) => {
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
    const content = useMemo<JSX.Element>(() => {
        try {
            return context.file
                ? buildEditor(template, { ...context.file.metadata })
                : null
        } catch (error) {
            if (process.env.NODE_ENV == "development")
                throw error;
            return null
        }
    }, [context.file, template])

    return  (
        <div className={styles.main}>
           { context.loading
                ? <Loading className={styles.loading}/>
                :content 
            }
        </div>
    )
}

export default Editor;