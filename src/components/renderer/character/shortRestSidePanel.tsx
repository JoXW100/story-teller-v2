import { useContext, useEffect, useMemo, useState } from 'react';
import { Context } from 'components/contexts/fileContext';
import { Context as StoryContext} from 'components/contexts/storyContext';
import ChargesRenderer from '../chargeToggle';
import Elements from 'data/elements';
import { getOptionType } from 'data/optionData';
import CharacterData from 'data/structures/character';
import DiceCollection from 'utils/data/diceCollection';
import { asNumber } from 'utils/helpers';
import Beyond20 from 'utils/beyond20';
import { ICharacterStorage } from 'types/database/files/character';
import { Attribute, DiceType, RestType } from 'types/database/dnd';
import { RollMethod } from 'types/dice';
import { IAbilityMetadata } from 'types/database/files/ability';
import styles from 'styles/renderer.module.scss';
import Localization from 'utils/localization';

type ShortRestSidePanelProps = React.PropsWithRef<{
    character: CharacterData
    storage: ICharacterStorage
    abilities: Record<string, IAbilityMetadata>
}>

const ShortRestSidePanel = ({ character, storage, abilities }: ShortRestSidePanelProps) => {
    const [_, storyDispatch] = useContext(StoryContext)
    const [__, dispatch] = useContext(Context)
    const [charges, setCharges] = useState<Partial<Record<DiceType, number>>>({})
    const hitDiceCollection = useMemo(() => {
        let collection = character.hitDiceCollection
        collection.add(character.hitDice)
        return collection
    }, [character])
    const recoverDiceCollection = useMemo(() => {
        const numDice = Object.values(charges).reduce((prev, val) => prev + val, 0)
        let collection = new DiceCollection(numDice * character.getAttributeModifier(Attribute.CON), "Short Rest Recovery", character.name)
        for (const dice of Object.values(DiceType) as DiceType[]) {
            if (charges[dice] && charges[dice] > 0) {
                collection.add(dice, charges[dice])
            }
        }
        return collection
    }, [charges, hitDiceCollection, storage])

    const handleShortRest = () => {
        let data = {...storage?.abilityData ?? {}}
        for (const key in abilities) {
            if (abilities[key].chargesReset === RestType.ShortRest && data[key]) {
                data[key].expendedCharges = 0
            }
        }
        dispatch.setStorage("abilityData", data)
        dispatch.closeSidePanel()
    }

    const handleRoll = () => {
        let max = character.healthValue
        let health = asNumber(storage?.health)
        let temp = asNumber(storage?.tempHealth)
        storyDispatch.roll(recoverDiceCollection, character.name, RollMethod.Normal, (result) => {
            health = Math.max(Math.min(max, health + result.results[result.selectedIndex].sum + result.modifier), 0)
            let usedHitDice = Object.keys(charges).reduce((prev, key) => (
                { ...prev, [key]: (prev[key] ?? 0) + charges[key]}
            ), storage?.hitDice ?? {})
            dispatch.setStorage("health", health)
            dispatch.setStorage("hitDice", usedHitDice)
            Beyond20.sendHealthUpdate(character.name, health, max, temp)
        })
    }

    const handleSetExpended = (dice: DiceType, num: number) => {
        setCharges((charges) => ({ ...charges, [dice]: num }))
    }

    useEffect(() => {
        setCharges({})
    }, [storage, character])
    
    return (
        <div className={styles.shortRestSidePanel}>
            <span>{Localization.toText("character-shortRestDescription")}</span>
            <Elements.Line/>
            <Elements.Header3>Recover</Elements.Header3>
            <div className={styles.shortRestRecoverChargesHolder}>
                {Object.values(DiceType).map((dice: DiceType) => (
                    <div key={String(dice)}>
                        <span>{getOptionType("dice").options[dice]}</span>
                        <ChargesRenderer 
                            charges={hitDiceCollection.getNum(dice)}
                            fixed={asNumber(storage?.hitDice?.[dice])}
                            expended={charges[dice]}
                            setExpended={(num) => handleSetExpended(dice, num)}/>
                    </div>
                ))}
            </div>
            <button onClick={handleRoll} disabled={recoverDiceCollection.length === 0}>
                {`Roll: ${recoverDiceCollection.text}`}
            </button>
            <button onClick={handleShortRest}>
                {"Take Short Rest"}
            </button>
        </div>
    )
}

export default ShortRestSidePanel;