import ReactMarkdown from 'react-markdown';
import { useContext, useMemo } from 'react';
import { Context } from 'components/contexts/storyContext';
import CloseIcon from '@mui/icons-material/Close';
import Localization from 'classes/localization';
import SearchList from 'components/searchList';
import styles from 'styles/storyPage/helpMenu.module.scss';

const helpData = require('data/help.json');

const HelpMenu = () => {
    const [context, dispatch] = useContext(Context)

    const content =  useMemo(() => helpData?.content?.map((item, index) => ({
        keyWords: item.keyWords,
        value: index,
        content: <HelpItem item={item} key={index}/>
    })), [helpData])

    const handleClick = () => {
        dispatch.closeHelpMenu();
    }

    return (
        <div className={styles.background}>
            <div className={styles.main}>
                <div className={styles.header}>
                    {Localization.toText('helpMenu-title')}

                    <div 
                        className={styles.closeBtn}
                        tooltips={Localization.toText('helpMenu-close')}
                        onClick={handleClick}
                    >
                        <CloseIcon/>
                    </div>
                </div>
                <SearchList 
                    className={styles.list} 
                    items={content}
                    prompt={Localization.toText('helpMenu-prompt')}
                />
            </div>
        </div>
    )
}

const HelpItem = ({ item }) => {
    return (
        <div className={styles.item}>
            <div className={styles.itemTitle}> { item.title } </div> 
            <div className={styles.itemContent}>
                <ReactMarkdown>
                    { item.text }
                </ReactMarkdown>
            </div>
        </div>
    )
}

export default HelpMenu;
