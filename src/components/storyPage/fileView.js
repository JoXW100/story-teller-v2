import React, { useContext, useMemo } from 'react';
import FileContext, { Context } from 'components/contexts/fileContext';
import { Context as StoryContext } from 'components/contexts/storyContext';
import Divider from 'components/divider'
import Editor from './editor/editor'
import Renderer from './renderer/renderer'
import Templates from 'data/fileTemplates';
import Localization from 'classes/localization'
import styles from 'styles/storyPage/main.module.scss'
import '@types/fileContext'

/**
 * @returns {JSX.Element}
 */
const FileView = () => {
    const [context] = useContext(StoryContext);
    return (
        <FileContext storyId={context.story.id} fileId={context.fileId}>
            <FileContent/>
        </FileContext>
    );
}

const setDefaults = (template, metadata) => {
    switch (template.type)
    {
        case "root":
        case "group":
            template.content?.forEach((x) => setDefaults(x, metadata));
            break;
        default:
            if (template.params?.key && metadata[template.params.key] === undefined && template.params?.default)
                metadata[template.params.key] = template.params.default;
            break;
    }
}

const FileContent = () => {
    const [context] = useContext(Context)
    const [storyContext] = useContext(StoryContext);

    const Content = useMemo(() => {
        if (!context.file) {
            if (context.fileSelected)
                return <InvalidFileView/>
            return <NoSelectedFileView/>;
        }
        /** @type {FileTemplate} */
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
        console.error("No template for file type found");
        return null;
        
    }, [context, storyContext.editEnabled]);
    
    return Content;
}

const InvalidFileView = () => {
    return (
        <div className={styles.invalidFile}>
            { Localization.toText('storyPage-failedLoadFile') }
        </div>
    )
}

const NoSelectedFileView = () => {
    return (
        <div className={styles.invalidFile}>
            { Localization.toText('storyPage-noSelectedFile') }
        </div>
    )
}

export default FileView;