import React, { useContext, useEffect, useMemo } from 'react'
import Components, { TemplateComponentProps } from './components';
import { Context } from 'components/contexts/fileContext';
import Loading from 'components/common/loading';
import Logger from 'utils/logger';
import { EditInputType, RootTemplateComponent, ITemplateComponent, TemplateCondition, TemplateConditionType } from 'types/templates';
import { IFileMetadata } from 'types/database/files';
import styles from 'styles/pages/storyPage/editor.module.scss';
import { getRelativeMetadata } from 'utils/helpers';

type EditorProps = React.PropsWithRef<{
    template: RootTemplateComponent
    metadata: IFileMetadata
}>

interface ConditionsData {
    metadata: IFileMetadata
    mode?: TemplateConditionType
    cmp?: string | number | boolean
}

const isValue = (value: any): value is string | boolean | number | null   => {
    return typeof value === "string" || typeof value === "boolean" || typeof value === "number" || value === null
}
 
const handleCondition = (condition: TemplateCondition, data: ConditionsData) => {
    try {
        if (isValue(condition))
            return handleCondition({ type: TemplateConditionType.Value, value: condition }, data)
        switch (condition.type) {
            case TemplateConditionType.Equals:
            case TemplateConditionType.NotEquals:
                let params: ConditionsData = { ...data, cmp: "$empty", mode: condition.type }
                return condition.value?.every((x) => handleCondition(x, params)) ?? false;
            case TemplateConditionType.Metadata:
                if (data.cmp === "$empty") {
                    data.cmp = data.metadata[condition.value];
                    return true;
                }
                if (data.mode === TemplateConditionType.Equals)
                    return data.metadata[condition.value] == data.cmp
                if (data.mode === TemplateConditionType.NotEquals)
                    return data.metadata[condition.value] != data.cmp
                return false;
            case TemplateConditionType.Value: 
                if (data.cmp === "$empty") {
                    data.cmp = condition.value;
                    return true;
                }
                if (data.mode === TemplateConditionType.Equals)
                    return condition.value == data.cmp
                if (data.mode === TemplateConditionType.NotEquals)
                    return condition.value != data.cmp
                return false;
            case TemplateConditionType.Any:
                return condition.value?.some((x) => handleCondition(x, data)) ?? false;
            case TemplateConditionType.All:
                return condition.value?.every((x) => handleCondition(x, data)) ?? false;
            default:
                return true;
        }
    } catch (error: unknown) {
        Logger.throw("editor.handleCondition", error)
        return false
    }
}

const checkConditions = (template: ITemplateComponent, metadata: IFileMetadata): boolean => {
    const data: ConditionsData = { metadata: metadata }
    return template.conditions?.every((c) => handleCondition(c, data) ) ?? true
}

const getComponent = (type: EditInputType): (props: TemplateComponentProps) => React.ReactNode => {
    switch (type) {
        case EditInputType.Boolean: return Components.Boolean;
        case EditInputType.Group: return Components.Group
        case EditInputType.Editor: return Components.Editor
        case EditInputType.Text: return Components.Text;
        case EditInputType.Enum: return Components.Enum;
        case EditInputType.Textarea: return Components.Textarea;
        case EditInputType.ItemList: return Components.ItemList;
        case EditInputType.LinkList: return Components.LinkList;
        case EditInputType.LinkInput: return Components.LinkInput;
        case EditInputType.List: return Components.List;
        case EditInputType.Navigation: return Components.Navigation;
        case EditInputType.Option: return Components.Option;
        case EditInputType.Publish: return Components.Publish;
        case EditInputType.Selection: return Components.Selection;
        case EditInputType.SelectionInput: return Components.SelectionInput;
        case EditInputType.Number: return Components.Number;
        default: return null;
    }
}

export const buildEditor = (template: ITemplateComponent, metadata: IFileMetadata, matchSet: Set<string>, key = 0): React.ReactNode => {
    if (!checkConditions(template, metadata)) {
        return null;
    } else if (template?.params?.key && metadata[template.params.key] !== template.params.default) {
        matchSet.add(template.params.key)
    }
    
    const content = template.content?.map((item, key) => buildEditor(item, metadata, matchSet, key));
    if (template.type === EditInputType.Root) return content;
    
    const Component = getComponent(template.type);
    return Component && (
        <Component key={key} params={template.params}> 
            { content }
        </Component>
    )
}

const Editor = ({ template, metadata }: EditorProps): JSX.Element => {
    const [context, dispatch] = useContext(Context)

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
        return () => window && (window.onbeforeunload = null);
    }, [])
    
    const [content, matchSet] = useMemo<[React.ReactNode, Set<string>]>(() => {
        try {
            if (metadata) {
                let matchSet = new Set<string>()
                let result = buildEditor(template, metadata, matchSet)
                return [result, matchSet]
            }
            return [null, null]
        } catch (error: unknown) {
            Logger.throw("editor.content", error)
            return [null, null]
        }
    }, [context.editFilePages, template, metadata])

    useEffect(() => {
        if (matchSet) {
            for (var key in getRelativeMetadata(context.file.metadata, context.editFilePages)) {
                if (!key.startsWith('$') && !matchSet.has(key)) {
                    dispatch.removeMetadata(key)
                }
            }
        }
    }, [matchSet])

    return  (
        <div className={styles.main}>
           { context.fetching
                ? <Loading className={styles.loading}/>
                : content 
            }
        </div>
    )
}

export default Editor;