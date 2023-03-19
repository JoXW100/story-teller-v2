import { useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import CloseIcon from '@mui/icons-material/Close';
import { Context } from 'components/contexts/appContext';
import DropdownMenu from 'components/common/dropdownMenu';
import Navigation from 'utils/navigation';
import Localization from 'utils/localization';
import Palettes from 'data/palettes';
import styles from 'styles/pages/settingsPage.module.scss'

type SettingsPageProps = React.PropsWithRef<{
    returnURL?: string
}>

const SettingsPage = ({ returnURL }: SettingsPageProps): JSX.Element => {
    const [context, dispatch] = useContext(Context)
    const [state, setState] = useState({ 
        palette: context.palette ?? Object.keys(Palettes)[0] 
    })

    const palettes = Object.keys(Palettes).reduce((prev, val) => (
        { ...prev, [val]: Palettes[val].name }
    ), {})

    useEffect(() => {
        if (state.palette && state.palette != context.palette) {
            dispatch.setPalette(state.palette);
        }
    }, [state.palette])
    
    return (
        <div className={styles.main}>
            <div className={styles.header}>
                { Localization.toText("settingsPage-header")}
                <Link 
                    className={styles.closeButton}
                    tooltips={Localization.toText("settingsPage-close")}
                    href={Navigation.settingsReturnURL(returnURL)} 
                    passHref>
                    <CloseIcon/>
                </Link>
            </div>
            <div className={styles.body}>
                <div className={styles.row}>
                    {Localization.toText("settingsPage-palette")} 
                    <DropdownMenu 
                        className={styles.dropdown}
                        value={state.palette}
                        values={palettes}
                        onChange={(value) => setState({ ...state, palette: value }) }
                    />
                </div>
            </div>
        </div>
    )
}

export default SettingsPage;