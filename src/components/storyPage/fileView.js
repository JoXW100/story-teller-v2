import React, { useContext, useMemo } from 'react';
import FileContext, { Context } from 'components/contexts/fileContext';
import { Context as StoryContext } from 'components/contexts/storyContext';
import Divider from 'components/divider'
import Editor from './editor'
import Renderer from './renderer'
import styles from 'styles/storyPage/main.module.scss'
import '@types/fileContext'
import Localization from 'classes/localization';

/**
 * @returns {JSX.Element}
 */
const FileView = () => {
    const [context] = useContext(StoryContext)

    return (
        <FileContext storyId={context.story.id} fileId={context.fileId}>
            <FileContent/>
        </FileContext>
    );
}

const FileContent = () => {
    const [context] = useContext(Context)

    const Content = useMemo(() => {
        if (context.fileSelected && !context.file)
            return <InvalidFileView/>

        return context.editEnabled 
            ? <Divider 
                className={styles.content}
                minLeft={70}
                minRight={50}
                left={<Editor/>}
                right={<Renderer/>}
              />  
            : <Renderer/>
    }, [context]);

    return Content;
}

const InvalidFileView = () => {
    return (
        <div className={styles.invalidFile}>
            { Localization.toText('storyPage-failedLoadFIle') }
        </div>
    )
}

export default FileView;