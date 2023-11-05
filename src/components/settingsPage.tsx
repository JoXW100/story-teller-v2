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
import Communication from 'utils/communication';
import { isEnum } from 'utils/helpers';
import { ViewMode } from 'types/context/appContext';
import styles from 'styles/pages/settingsPage.module.scss';

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

    const handleClearCache = () => {
        dispatch.clearCommunicationCache()
    }

    return (
        <div className={styles.main}>
            <div className={styles.header}>
                <span> { Localization.toText("settingsPage-header")} </span>
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
                    <span>{Localization.toText("settingsPage-palette")} </span>
                    <DropdownMenu 
                        itemClassName={styles.dropdownItem}
                        value={context.palette}
                        values={palettes}
                        onChange={(value) => dispatch.setPalette(value) }/>
                </div>
                <div className={styles.row}>
                    <span>{Localization.toText("settingsPage-viewMode")}</span>
                    <DropdownMenu 
                        itemClassName={styles.dropdownItem}
                        value={context.viewMode}
                        values={viewModes}
                        onChange={(value) => isEnum(value, ViewMode) && dispatch.setViewMode(value)}/>
                </div>
                <div className={styles.row}>
                    <span>{Localization.toText("settingsPage-syntaxHighlighting")}</span> 
                    <Checkbox
                        className={styles.checkbox}
                        value={context.enableSyntaxHighlighting}
                        onChange={(value) => dispatch.setEnableSyntaxHighlighting(value)}/>
                </div>
                <div className={styles.row}>
                    <span>{Localization.toText("settingsPage-rowNumbers")}</span> 
                    <Checkbox
                        className={styles.checkbox}
                        value={context.enableRowNumbers}
                        onChange={(value) => dispatch.setEnableRowNumbers(value)}/>
                </div>
                <div className={styles.row}>
                    <span>{Localization.toText("settingsPage-colorFileByType")}</span> 
                    <Checkbox
                        className={styles.checkbox}
                        value={context.enableColorFileByType}
                        onChange={(value) => dispatch.setEnableColorFileByType(value)}/>
                </div>
                <div className={styles.row}>
                    <span>{Localization.toText("settingsPage-automaticLineBreak")}</span> 
                    { context.automaticLineBreak !== 0 &&
                        <NumberInput
                            className={styles.numberInput}
                            value={context.automaticLineBreak}
                            setValue={(value) => dispatch.setAutomaticLineBreak(value)}/>
                    }
                    <Checkbox
                        className={styles.checkbox}
                        value={context.automaticLineBreak > 0}
                        onChange={(value) => dispatch.setAutomaticLineBreak(value ? 80 : 0)}/>
                </div>
                <div className={styles.row}>
                    <span>{Localization.toText("settingsPage-hideRolls")}</span> 
                    <Checkbox
                        className={styles.checkbox}
                        value={context.hideRolls}
                        onChange={(value) => dispatch.setHideRolls(value)}/>
                </div>
                <div className={styles.row}>
                    <span>{Localization.toText("settingsPage-cashedEntries", Communication.cachedEntries.length)}</span> 
                    <button 
                        className={styles.button} 
                        onClick={handleClearCache}
                        disabled={Communication.cachedEntries.length == 0}>
                        {Localization.toText("settingsPage-clearCache")}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default SettingsPage;