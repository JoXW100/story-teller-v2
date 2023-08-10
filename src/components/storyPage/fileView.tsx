import React, { useContext, useMemo } from 'react';
import FileContext, { Context } from 'components/contexts/fileContext';
import { Context as StoryContext } from 'components/contexts/storyContext';
import { Context as AppContext } from 'components/contexts/appContext';
import Divider from 'components/common/controls/divider';
import Editor from './editor';
import Renderer from './renderer';
import { getTemplate } from 'data/fileTemplates';
import Localization from 'utils/localization'
import Logger from 'utils/logger';
import { EditInputType, FileTemplate, RootTemplateComponent, TemplateComponent } from 'types/templates';
import { FileMetadata } from 'types/database/files';
import { ViewMode } from 'types/context/appContext';
import styles from 'styles/pages/storyPage/main.module.scss'
import { EditFilePage } from 'types/context/fileContext';
import { getRelativeMetadata, isEnum } from 'utils/helpers';
import { getOptionType } from 'data/optionData';

const setDefaults = (template: TemplateComponent, metadata: FileMetadata) => {
    switch (template.type) {
        case EditInputType.Root:
        case EditInputType.Group:
            template.content?.forEach((x) => setDefaults(x, metadata));
            break;
        default:
            if (template.params?.key && metadata[template.params.key] === undefined && template.params?.default)
                metadata[template.params.key] = template.params.default;
            break;
    }
}

const FileView = (): JSX.Element => {
    const [context] = useContext(StoryContext);
    return (
        <FileContext storyId={context.story.id} fileId={context.fileId}>
            <FileContent/>
        </FileContext>
    );
}

const getFileEditorRoot = (template: FileTemplate, pages: EditFilePage[]): RootTemplateComponent => {
    if (pages.length > 0 && template.editorSubTemplates) {
        let subTemplateKey = pages[pages.length - 1].template;
        return template.editorSubTemplates[subTemplateKey]
    }
    return template.editor
}

const FileContent = (): JSX.Element => {
    const [context] = useContext(Context)
    const [storyContext] = useContext(StoryContext);
    const [appContext] = useContext(AppContext);

    const Content = useMemo(() => {
        if (!context.file && context.fileSelected)
            return <InvalidFileView/>
        if (!context.file)
            return <NoSelectedFileView/>;
            
        let template = getTemplate(context.file.type)
        if (template) {
            let pages = context.editFilePages ?? []
            let editorRoot = getFileEditorRoot(template, pages)
            let metadata = getRelativeMetadata(context.file?.metadata, pages) ?? {}
            setDefaults(editorRoot, metadata)
            return appContext.viewMode === ViewMode.SplitView ? (
                <Divider
                    className={styles.fileDivider}
                    minLeft={70}
                    minRight={50}
                    collapsed={storyContext.editEnabled}
                    left={<Editor key="editor" template={editorRoot} metadata={metadata}/>}
                    right={<Renderer key="renderer" template={template.renderer}/>}/>
            ) : storyContext.editEnabled 
            ? <Editor template={editorRoot} metadata={metadata}/>
            : <Renderer template={template.renderer}/>
        }
        Logger.error("FileContent.template", `No template for file type found, type: ${context?.file?.type}`)
        return null;
    }, [context, context.file, context.file?.type, context.editFilePages, appContext.viewMode, storyContext.editEnabled]);
    
    return (
        <div className={styles.content}>
            { Content }
        </div>
    );
}

const InvalidFileView = (): JSX.Element => {
    return (
        <div className={styles.invalidFile}>
            { Localization.toText('storyPage-failedLoadFile') }
        </div>
    )
}

const NoSelectedFileView = (): JSX.Element => {
    return (
        <div className={styles.invalidFile}>
            { Localization.toText('storyPage-noSelectedFile') }
        </div>
    )
}

export default FileView;