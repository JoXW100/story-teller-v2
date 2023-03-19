import StoryCard from './storyCard';
import { PageStatus, StoryCardData } from 'types/homePage';
import styles from 'styles/pages/homePage/menu.module.scss';

type SelectStoryMenuProps = React.PropsWithRef<{
    cards: StoryCardData[],
    setStatus: (status: PageStatus) => void
}>

const SelectStoryMenu = ({ cards, setStatus }: SelectStoryMenuProps): JSX.Element => {
    return (
        <div className={styles.selectMenu}>
            { cards
                .sort((a, b) => b.dateUpdated - a.dateUpdated)
                .map((card, index) => (
                    <StoryCard 
                        key={index} 
                        data={card} 
                        setStatus={setStatus}/>
                )) 
            }
        </div>
    )
}

export default SelectStoryMenu