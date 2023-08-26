import React, { useContext } from 'react'
import BackIcon from '@mui/icons-material/ChevronLeftSharp';
import { Context } from 'components/contexts/fileContext';
import { TemplateComponentProps } from '.';
import { NavigationTemplateParams } from 'types/templates';
import styles from 'styles/pages/storyPage/editor.module.scss'
import Localization from 'utils/localization';

const NavigationComponent = ({ params }: TemplateComponentProps<NavigationTemplateParams>): JSX.Element => {
    const [context, dispatch] = useContext(Context)
    const page = context.editFilePages.map(page => page.name).join(' -> ')

    const handleClick = () => {
        dispatch.closeTemplatePage()
    }

    return (
        <div className={styles.navigation}>
            <label>{page ?? "Missing page name"}</label>
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