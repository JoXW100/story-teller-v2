import StoryCard from './storyCard';
import styles from 'styles/homePage.module.scss'
import { HomePageState, PageStatus } from '.';

type SelectStoryMenuProps = React.PropsWithRef<{
    state: HomePageState,
    setStatus: (status: PageStatus) => void
}>

const SelectStoryMenu = ({ state, setStatus }: SelectStoryMenuProps): JSX.Element => {
    return (
        <div className={styles.selectMenu}>
            { state.cards
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