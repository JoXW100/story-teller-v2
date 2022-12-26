import { useContext } from 'react';
import { Context } from 'components/contexts/storyContext';
import HelpIcon from '@mui/icons-material/QuestionMarkSharp';
import Localization from 'utils/localization';
import styles from 'styles/storyPage/main.module.scss';

const HelpMenuButton = (): JSX.Element => {
    const [_, dispatch] = useContext(Context);
    const handleClick = () => {
        dispatch.openHelpMenu()
    }

    return (
        <div 
            className={styles.help} 
            onClick={handleClick}
            tooltips={Localization.toText('storyPage-helpMenu')}
        >
            <HelpIcon/>
        </div>
    )
}

export default HelpMenuButton