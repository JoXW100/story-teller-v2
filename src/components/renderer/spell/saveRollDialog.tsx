import { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { closePopup } from 'components/common/popupHolder';
import DropdownMenu from 'components/common/controls/dropdownMenu';
import { Attribute } from 'types/database/dnd';
import { getOptionType } from 'data/optionData';
import styles from 'styles/renderer.module.scss';


export interface SaveRunData {
    type: "none" | "save" | "check"
    attr: Attribute
}

type SaveRollDialogProps = React.PropsWithRef<{
    callback: (data: SaveRunData) => void
}> 

const SaveRollDialog = ({ callback }: SaveRollDialogProps): JSX.Element => {
    const attrOptions = getOptionType("attr")
    const typeOptions: Partial<Record<SaveRunData["type"], string>> = { "save": "Saving throw", "check": "Check" }
    const [state, setState] = useState<SaveRunData>({
        type: "save",
        attr: attrOptions.default
    })

    const handleTypeChanged = (value: SaveRunData["type"]) => {
        setState({ ...state, type: value })
    }

    const handleAttrChanged = (value: Attribute) => {
        setState({ ...state, attr: value })
    }

    const handleApply = () => {
        callback(state)
        closePopup()
    }
    
    return (
        <div className={styles.saveRollDialog}>
            <div className={styles.saveRollDialogHeader}>
                <label>Roll Save/Check</label>
                <button onClick={closePopup} tooltips='Close'>
                    <CloseIcon/>
                </button>
            </div>
            <div className={styles.saveRollDialogBody}>
                <DropdownMenu 
                    value={state.type} 
                    values={typeOptions}
                    className={styles.dropdown}
                    itemClassName={styles.dropdownItem}
                    onChange={handleTypeChanged}/>
                <DropdownMenu 
                    value={state.attr} 
                    values={attrOptions.options}
                    className={styles.dropdown}
                    itemClassName={styles.dropdownItem}
                    onChange={handleAttrChanged}/>
                <button onClick={handleApply}>
                    Apply 
                </button>
            </div>
        </div>
    )
}

export default SaveRollDialog