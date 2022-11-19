import { useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import CloseIcon from '@mui/icons-material/Close';
import { Context } from 'components/contexts/appContext';
import Navigation from 'utils/navigation';
import Localization from 'classes/localization';
import DropdownMenu from 'components/dropdownMenu';
import Palettes from 'data/palettes';
import styles from 'styles/settingsPage/main.module.scss'

const getPalettes = () => {
    var palettes = {}
    Object.keys(Palettes).forEach((key) => {
        palettes[key] = Palettes[key].name
    })
    return palettes;
} 

/**
 * @returns {JSX.Element}
 */
const SettingsPage = ({ returnURL }) => {
    const [context, dispatch] = useContext(Context)
    const [state, setState] = useState({ 
        palette: context.palette ?? Object.keys(Palettes)[0] 
    })

    useEffect(() => {
        if (state.palette && state.palette != context.palette) {
            dispatch.setPalette(state.palette);
        }
    }, [state.palette])
    
    return (
        <div className={styles.main}>
            <div className={styles.menu}>
                <div className={styles.header}>
                    { Localization.toText("settingsPage-header")}
                    <Link 
                        href={Navigation.SettingsReturnURL(returnURL)}
                        tooltips={Localization.toText("settingsPage-close")}
                    >
                        <div className={styles.close}>
                            <CloseIcon/>
                        </div>
                    </Link>
                </div>
                <div className={styles.body}>
                    <div className={styles.row}>
                        <div className={styles.label}> 
                            {Localization.toText("settingsPage-palette")} 
                        </div>
                        <DropdownMenu 
                            className={styles.dropdown}
                            values={getPalettes()}
                            value={state.palette}
                            onChange={(value) => setState({ ...state, palette: value }) }
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SettingsPage;