import React, { useContext, useMemo } from 'react';
import FileContext, { Context } from 'components/contexts/fileContext';
import { Context as StoryContext } from 'components/contexts/storyContext';
import Divider from 'components/divider'
import Editor from './editor/editor'
import Renderer from './renderer'
import styles from 'styles/storyPage/main.module.scss'
import Localization from 'classes/localization'
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

const FileContent = () => {
    const [context] = useContext(Context)
    const [storyContext] = useContext(StoryContext);

    const Content = useMemo(() => {
        if (context.fileSelected && !context.file)
            return <InvalidFileView/>
        if (!storyContext.editEnabled && !context.file)
            return <NoSelectedFileView/>

        return storyContext.editEnabled 
            ? <Divider 
                className={styles.content}
                minLeft={70}
                minRight={50}
                left={<Editor/>}
                right={<Renderer/>}
              />  
            : <Renderer/>
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