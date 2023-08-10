import React, { useContext } from 'react'
import BackIcon from '@mui/icons-material/ChevronLeftSharp';
import { Context } from 'components/contexts/fileContext';
import { TemplateComponentProps } from '.';
import { NavigationTemplateParams } from 'types/templates';
import styles from 'styles/pages/storyPage/editor.module.scss'
import Localization from 'utils/localization';

const NavigationComponent = ({ params }: TemplateComponentProps<NavigationTemplateParams>): JSX.Element => {
    const [context, dispatch] = useContext(Context)
    const page = context.editFilePages[context.editFilePages.length - 1]

    const handleClick = () => {
        dispatch.closeTemplatePage()
    }

    return (
        <div className={styles.navigation}>
            <label> {page.name ?? "Missing page name"}</label>
            <button 
                className={styles.navigationButton} 
                onClick={handleClick}
                tooltips={Localization.toText('editor-navigationButton')}>
                <BackIcon/>
            </button>
        </div>
    )
}
export default NavigationComponent;