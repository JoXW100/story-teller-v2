import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import CloseIcon from '@mui/icons-material/Close';
import SearchList, { SearchItem } from 'components/common/controls/searchList';
import { closePopup } from 'components/common/popupHolder';
import { HelpData } from 'data';
import Localization from 'utils/localization';
import { IHelpDataEntry } from 'types/help';
import styles from 'styles/pages/storyPage/helpMenu.module.scss';

const HelpMenu = (): JSX.Element => {
    const content =  useMemo<SearchItem[]>(() => HelpData?.content?.map((item, index) => ({
        keyWords: item.keyWords,
        value: index,
        content: <HelpItem item={item} key={index}/>
    })), [HelpData])

    const handleClick = () => {
        closePopup()
    }

    return (
        <div className={styles.main}>
            <div className={styles.header}>
                <h2>{Localization.toText('helpMenu-title')}</h2>
                <button 
                    className={styles.closeBtn}
                    onClick={handleClick}
                    tooltips={Localization.toText('helpMenu-close')}
                >
                    <CloseIcon/>
                </button>
            </div>
            <SearchList 
                items={content}
                prompt={Localization.toText('helpMenu-prompt')}
                placeholder={Localization.toText('helpMenu-placeholder')}/>
        </div>
    )
}

type HelpItemProps = React.PropsWithRef<{
    item: IHelpDataEntry
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
