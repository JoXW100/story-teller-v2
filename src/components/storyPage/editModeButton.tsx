import { useMemo } from "react";
import Link from 'next/link';
import Localization from 'utils/localization';
import Navigation from 'utils/navigation';
import EnableEditIcon from '@mui/icons-material/EditSharp';
import DisableEditIcon from '@mui/icons-material/EditOffSharp';
import styles from 'styles/storyPage/main.module.scss'

type EditModeButtonProps = React.PropsWithRef<{
    editEnabled: boolean
}>

interface EditModeData {
    tooltips: string
    icon: any
}

const EditModeButton = ({ editEnabled }: EditModeButtonProps): JSX.Element => {
    const data = useMemo<EditModeData>(() => (
        editEnabled ? {
            tooltips: Localization.toText('storyPage-disableEditMode'),
            icon: DisableEditIcon
        } : {
            tooltips: Localization.toText('storyPage-enableEditMode'),
            icon: EnableEditIcon
        }
    ), [location, editEnabled])
    
    return (
        <Link href={Navigation.editModeURL(!editEnabled)} passHref>
            <div 
                className={styles.editMode} 
                // @ts-ignore
                tooltips={data.tooltips}
            >
                <data.icon sx={{ height: "100%" }}/>
            </div>
        </Link>
    )
}

export default EditModeButton