import { useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import CloseIcon from '@mui/icons-material/Close';
import { Context } from 'components/contexts/appContext';
import DropdownMenu from 'components/common/dropdownMenu';
import Navigation from 'utils/navigation';
import Localization from 'utils/localization';
import Palettes from 'data/palettes';
import styles from 'styles/pages/settingsPage.module.scss'
import { ViewMode } from 'types/context/appContext';

type SettingsPageProps = React.PropsWithRef<{
    returnURL?: string
}>

const SettingsPage = ({ returnURL }: SettingsPageProps): JSX.Element => {
    const [context, dispatch] = useContext(Context)
    const [state, setState] = useState({ 
        palette: Object.keys(Palettes).includes(context.palette) 
            ? context.palette 
            : Object.keys(Palettes)[0],
        viewMode: [ViewMode.Exclusive, ViewMode.SplitView].includes(context.viewMode) 
            ? context.viewMode
            : ViewMode.SplitView
    })

    const palettes = Object.keys(Palettes).reduce((prev, val) => (
        { ...prev, [val]: Palettes[val].name }
    ), {} as Record<string, string>) 

    const viewModes = {
        [ViewMode.SplitView]: "Split View",
        [ViewMode.Exclusive]: "Exclusive" 
    } as Record<ViewMode, string>

    useEffect(() => {
        if (state.palette && state.palette != context.palette) {
            dispatch.setPalette(state.palette);
        }
        if (state.viewMode && state.viewMode != context.viewMode) {
            dispatch.setViewMode(state.viewMode);
        }
    }, [state.palette, state.viewMode])
    
    return (
        <div className={styles.main}>
            <div className={styles.header}>
                <label>
                    { Localization.toText("settingsPage-header")}
                </label>
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
                    {Localization.toText("settingsPage-palette")} 
                    <DropdownMenu 
                        itemClassName={styles.dropdownItem}
                        value={state.palette}
                        values={palettes}
                        onChange={(value) => setState({ ...state, palette: value }) }
                    />
                </div>
                <div className={styles.row}>
                    {Localization.toText("settingsPage-viewMode")} 
                    <DropdownMenu 
                        itemClassName={styles.dropdownItem}
                        value={state.viewMode}
                        values={viewModes}
                        onChange={(value) => setState({ ...state, viewMode: value as ViewMode }) }
                    />
                </div>
            </div>
        </div>
    )
}

export default SettingsPage;