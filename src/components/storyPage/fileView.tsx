import React, { useContext, useMemo } from 'react';
import FileContext, { Context } from 'components/contexts/fileContext';
import { Context as StoryContext } from 'components/contexts/storyContext';
import Divider from 'components/common/divider'
import Editor from './editor/editor'
import Templates from 'data/fileTemplates';
import Localization from 'utils/localization'
import Renderer from './renderer';
import styles from 'styles/storyPage/main.module.scss'
import { TemplateComponent } from 'types/templates';
import { FileMetadata } from 'types/database/files';

const FileView = (): JSX.Element => {
    const [context] = useContext(StoryContext);
    return (
        <FileContext storyId={context.story.id} fileId={context.fileId}>
            <FileContent/>
        </FileContext>
    );
}

const setDefaults = (template: TemplateComponent, metadata: FileMetadata) => {
    switch (template.type) {
        case "root":
        case "group":
            template.content?.forEach((x) => setDefaults(x, metadata));
            break;
        default:
            if (template.params?.key && metadata[template.params.key as string] === undefined && template.params?.default)
                metadata[template.params.key as string] = template.params.default;
            break;
    }
}

const FileContent = (): JSX.Element => {
    const [context] = useContext(Context)
    const [storyContext] = useContext(StoryContext);

    const Content = useMemo(() => {
        if (!context.file && context.fileSelected)
            return <InvalidFileView/>
        if (!context.file)
            return <NoSelectedFileView/>;
            
        var template = Templates[context.file.type]
        if (template) {
            setDefaults(template.editor, context.file.metadata ?? {})
            return storyContext.editEnabled 
                ? <Divider 
                    className={styles.content}
                    minLeft={70}
                    minRight={50}
                    left={<Editor template={template.editor}/>}
                    right={<Renderer template={template.renderer}/>}
                />  
                : <Renderer template={template.renderer}/>
        }
        console.error("No template for file type found, type:", context?.file?.type);
        return null;
        
    }, [context, storyContext.editEnabled]);
    
    return Content;
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