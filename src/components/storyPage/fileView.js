import React, { useContext, useMemo } from 'react';
import FileContext, { Context } from 'components/contexts/fileContext';
import { Context as StoryContext } from 'components/contexts/storyContext';
import Divider from 'components/divider'
import Editor from './editor/editor'
import Renderer from './renderer/renderer'
import styles from 'styles/storyPage/main.module.scss'
import Localization from 'classes/localization'
import '@types/fileContext'
import Templates from 'data/fileTemplates';

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

const FileContent = () => {
    const [context] = useContext(Context)
    const [storyContext] = useContext(StoryContext);

    const Content = useMemo(() => {
        if (context.fileSelected && !context.file)
            return <InvalidFileView/>
        if (!storyContext.editEnabled && !context.file)
            return <NoSelectedFileView/>

        /** @type {FileTemplate} */
        var template = Templates[context.file.type]
        if (template) {
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