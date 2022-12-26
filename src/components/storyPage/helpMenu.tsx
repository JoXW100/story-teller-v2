import { useContext, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import SearchList from 'components/common/searchList';
import Localization from 'utils/localization';
import { Context } from 'components/contexts/storyContext';
import CloseIcon from '@mui/icons-material/Close';
import { HelpData, HelpDataEntry } from 'types/help';
import styles from 'styles/storyPage/helpMenu.module.scss';

const HelpData = require('data/help.json') as HelpData;

const HelpMenu = (): JSX.Element => {
    const [_, dispatch] = useContext(Context)

    const content =  useMemo(() => HelpData?.content?.map((item, index) => ({
        keyWords: item.keyWords,
        value: index,
        content: <HelpItem item={item} key={index}/>
    })), [HelpData])

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
                        onClick={handleClick}
                        tooltips={Localization.toText('helpMenu-close')}
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

type HelpItemProps = React.PropsWithRef<{
    item: HelpDataEntry
}>

const HelpItem = ({ item }: HelpItemProps): JSX.Element => {
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
