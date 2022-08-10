import React, { useContext } from 'react';
import { Context as StoryContext } from 'components/contexts/storyContext';
import FileContext from 'components/contexts/fileContext';
import Divider from 'components/divider'
import Editor from './editor'
import Renderer from './renderer'
import styles from 'styles/storyPage/main.module.scss'
import '@types/fileContext'

/**
 * @returns {JSX.Element}
 */
const FileView = () => {
    const [context] = useContext(StoryContext)

    return (
        <FileContext fileId={context.fileId}>
            { context.editEnabled 
                ? <Divider 
                    className={styles.content}
                    minLeft={70}
                    minRight={50}
                    left={<Editor/>}
                    right={<Renderer/>}
                    />  
                : <Renderer/>
            }
        </FileContext>
    );
}

export default FileView;