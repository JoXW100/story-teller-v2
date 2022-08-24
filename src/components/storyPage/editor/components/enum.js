import React, { useContext } from 'react'
import { Context } from 'components/contexts/fileContext';
import { AbilityType, Alignment, Attribute, CreatureSize, CreatureType, DamageType, Dice, EffectCondition, Scaling, MovementType, Skill, ActionType, OptionalAttribute } from '@enums/database';
import DropdownMenu from 'components/dropdownMenu';
import styles from 'styles/storyPage/editor.module.scss'
import '@types/data';

const Enums = {
    "creatureSize": CreatureSize,
    "creatureType": CreatureType,
    "alignment": Alignment,
    "dice": Dice,
    "attr": Attribute,
    "movement": MovementType,
    "skill": Skill,
    "abilityType": AbilityType,
    "effectCondition": EffectCondition,
    "scaling": Scaling,
    "damageType": DamageType,
    "action": ActionType,
    "optionalAttr": OptionalAttribute
}

/**
 * 
 * @param {{ children: JSX.Element, params: EnumParams<any> }} 
 * @returns {JSX.Element}
 */
const EnumComponent = ({ params }) => {
    const [context, dispatch] = useContext(Context)
    const Enum = Enums[params.type];
    if (!Enum){
        console.error("No enum of that type")
        return null;
    }
    const value = context.file?.metadata 
        ? context.file.metadata[params.key] ?? params.default
        : params.default;

    const values = Object.keys(Enum)
        .reduce((prev, key) => ({ ...prev, [Enum[key]]: key }), {});

    /** @param {string} value */
    const handleInput = (value) => {
        dispatch.setMetadata(params.key, value);
    }

    return (
        <div className={styles.editEnum}>
            <b> {`${ params.label ?? "label"}:`} </b>
            <DropdownMenu 
                className={styles.dropdown} 
                values={values} 
                value={value}
                onChange={handleInput}
            />
        </div>
    )
}
export default EnumComponent;