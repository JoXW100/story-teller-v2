import React, { useContext, useMemo } from 'react'
import { Context } from 'components/contexts/fileContext';
import { CreatureSize, CreatureType, Alignment, Dice, MovementType, Attribute, Skill } from '@enums/database';
import { CalculationMode } from '@enums/editor';
import SelectionMenu from 'components/selectionMenu';
import styles from 'styles/storyPage/editor.module.scss';
import '@types/data';

const Enums = {
    "creatureSize": CreatureSize,
    "creatureType": CreatureType,
    "alignment": Alignment,
    "dice": Dice,
    "movement": MovementType,
    "attr": Attribute,
    "calc": CalculationMode,
    "skill": Skill
}

/**
 * 
 * @param {{ params: SelectionParams<any> }} 
 * @returns {JSX.Element}
 */
const SelectionComponent = ({ params }) => {
    const [context, dispatch] = useContext(Context)
    const Enum = Enums[params.enum];
    if (!Enum){
        console.error("No enum of that type")
        return null;
    }
    /** @type {Object<string,any>} */
    const selection = context.file?.metadata 
        ? context.file.metadata[params.key] ?? {}
        : {};
        
    /** @param {[string]} selected */
    const handleChange = (selected) => {
        const data = {};
        selected.forEach((key) => (data[key] = selection[key] ?? params.default))
        dispatch.setMetadata(params.key, data)
    }

    /** 
     * @param {string} val 
     * @param {any} value
     */
    const handleInput = (val, value) => {
        var key = Enum[val];
        key && (selection[key] = value);
        dispatch.setMetadata(params.key, selection)
    }

    const values = useMemo(() => (
        Object.keys(Enum).reduce((prev, val) => 
            ({ ...prev, [Enum[val]]: { text: val, element: (
                <SelectionItemElement 
                    item={val} 
                    value={selection[Enum[val]]}
                    onChange={handleInput}
                    inputType="number"
                />
            )}})
        , {})
    ), [selection, context.file.metadata])
    return (
        <div className={styles.editSelection}>
            <b> {`${ params.label ?? "label"}:`} </b>
            <SelectionMenu
                className={styles.selection}
                values={values}
                selection={Object.keys(selection)}
                onChange={handleChange}
            />
        </div>
    )
}

/**
 * 
 * @param {{ 
 *  item: string, 
 *  value: string, 
 *  onChange: (val: string, value: string>) => void, 
 *  inputType: string 
 * }} 
 * @returns {JSX.Element}
 */
const SelectionItemElement = ({ item, value, onChange, inputType }) => {
    return (
        <div className={styles.editSelectionItem}>
            <b>{item}</b>
            <input 
                type={inputType} 
                value={value ?? ""} 
                onChange={(e) => onChange(item, e.target.value)}
            />
        </div>
    )
}

export default SelectionComponent;