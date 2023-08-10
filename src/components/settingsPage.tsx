import { useContext } from 'react';
import Link from 'next/link';
import CloseIcon from '@mui/icons-material/Close';
import { Context } from 'components/contexts/appContext';
import DropdownMenu from 'components/common/controls/dropdownMenu';
import NumberInput from './common/controls/numericInput';
import Checkbox from './common/checkbox';
import Palettes from 'data/palettes';
import Navigation from 'utils/navigation';
import Localization from 'utils/localization';
import { ViewMode } from 'types/context/appContext';
import styles from 'styles/pages/settingsPage.module.scss';
import { isEnum } from 'utils/helpers';

type SettingsPageProps = React.PropsWithRef<{
    returnURL?: string
}>

const viewModes: Record<ViewMode, string> = {
    [ViewMode.SplitView]: "Split View",
    [ViewMode.Exclusive]: "Exclusive" 
}

const SettingsPage = ({ returnURL }: SettingsPageProps): JSX.Element => {
    const [context, dispatch] = useContext(Context)
    const palettes = Object.keys(Palettes).reduce<Record<string, string>>((prev, val) => (
        { ...prev, [val]: Palettes[val].name }
    ), {}) 
    return (
        <div className={styles.main}>
            <div className={styles.header}>
                <label> { Localization.toText("settingsPage-header")} </label>
                <Link 
                    className={styles.closeButton}
                    href={Navigation.settingsReturnURL(returnURL)}>
                    <button tooltips={Localization.toText("settingsPage-close")}>
                        <CloseIcon/>
                    </button>
                </Link>
            </div>
            <div className={styles.body}>
                <div className={styles.row}>
                    <label>{Localization.toText("settingsPage-palette")} </label>
                    <DropdownMenu 
                        itemClassName={styles.dropdownItem}
                        value={context.palette}
                        values={palettes}
                        onChange={(value) => dispatch.setPalette(value) }/>
                </div>
                <div className={styles.row}>
                    <label>{Localization.toText("settingsPage-viewMode")}</label>
                    <DropdownMenu 
                        itemClassName={styles.dropdownItem}
                        value={context.viewMode}
                        values={viewModes}
                        onChange={(value) => isEnum(value, ViewMode) && dispatch.setViewMode(value)}/>
                </div>
                <div className={styles.row}>
                    <label>{Localization.toText("settingsPage-syntaxHighlighting")}</label> 
                    <Checkbox
                        className={styles.checkbox}
                        value={context.enableSyntaxHighlighting}
                        onChange={(value) => dispatch.setEnableSyntaxHighlighting(value)}/>
                </div>
                <div className={styles.row}>
                    <label>{Localization.toText("settingsPage-rowNumbers")}</label> 
                    <Checkbox
                        className={styles.checkbox}
                        value={context.enableRowNumbers}
                        onChange={(value) => dispatch.setEnableRowNumbers(value)}/>
                </div>
                <div className={styles.row}>
                    <label>{Localization.toText("settingsPage-colorFileByType")}</label> 
                    <Checkbox
                        className={styles.checkbox}
                        value={context.enableColorFileByType}
                        onChange={(value) => dispatch.setEnableColorFileByType(value)}/>
                </div>
                <div className={styles.row}>
                    <label>{Localization.toText("settingsPage-automaticLineBreak")}</label> 
                    <NumberInput
                        className={styles.numberInput}
                        value={context.automaticLineBreak}
                        setValue={(value) => dispatch.setAutomaticLineBreak(value)}/>
                    <Checkbox
                        className={styles.checkbox}
                        value={context.automaticLineBreak > 0}
                        onChange={(value) => dispatch.setAutomaticLineBreak(value ? 80 : 0)}/>
                </div>
            </div>
        </div>
    )
}

export default SettingsPage;