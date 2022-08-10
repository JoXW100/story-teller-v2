import StoryCard from './storyCard';
import styles from 'styles/homePage/selectMenu.module.scss'
import '@types/homePage'

/**
 * @param {{state: HomePageState, setState: React.Dispatch<HomePageState>}} 
 * @returns {JSX.Element}
 */
const SelectStoryMenu = ({ state, setState }) => {
    return (
        <div className={styles.selectMenu}>
            { state.cards
                .sort((a, b) => b.updated - a.updated)
                .map((card, index) => (
                    <StoryCard 
                        key={index} 
                        data={card} 
                        setState={setState}
                    />
                )) 
            }
        </div>
    )
}

export default SelectStoryMenu