import StoryCard from './storyCard';
import styles from 'styles/homePage.module.scss'
import { PageStatus, StoryCardData } from 'types/homePage';

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
                        setStatus={setStatus}
                    />
                )) 
            }
        </div>
    )
}

export default SelectStoryMenu