import { useContext, useMemo } from 'react';
import { Context } from 'components/contexts/fileContext';
import Link from 'next/link';
import Elements from 'data/elements';
import CreatureData from 'data/structures/creature';
import Navigation from 'utils/navigation';
import useCreatureHandler from 'utils/handlers/creatureHandler';
import useCharacterHandler from 'utils/handlers/characterHandler';
import { ObjectId } from 'types/database';
import { IEncounterCard, IEncounterStorage } from 'types/database/files/encounter';
import { FileDataQueryResult } from 'types/database/responses';
import styles from 'styles/renderer.module.scss';
import EncounterData from 'data/structures/encounter';
import { RollMethod } from 'types/dice';
import Dice from 'utils/data/dice';
import { RollsState } from './encounter';
import { getOptionType } from 'data/optionData';

type CreatureCardProps = React.PropsWithRef<{
    data: FileDataQueryResult
    index: number
    encounter: EncounterData
    rolls: RollsState
    storage?: IEncounterStorage
}>

type EncounterCardProps = React.PropsWithRef<{
    id: ObjectId
    creature: CreatureData
    encounter: EncounterData
    rolls: RollsState
    index: number
    storage?: IEncounterStorage
}>

const EncounterCard = ({ id, creature, encounter, rolls, index, storage }: EncounterCardProps): JSX.Element => {
    const [_, dispatch] = useContext(Context)
    const initiativeBonus = creature.initiativeValue
    const card = storage.cards?.[index] ?? {}
    const initiative = card.initiative > 0 ? card.initiative + initiativeBonus : 0
    const order = -initiative * 100 - initiativeBonus
    const num = encounter.creatures.slice(0, index + 1).reduce((prev, x) => String(x) === String(id) ? prev + 1 : prev, 0)
    const roll = rolls.rolls[index]
    const attrOptions = getOptionType("attr")

    const maxHealth = useMemo<number>(() => {
        if (!isNaN(card.maxHealth)) {
            Dice.seed(card.maxHealth)
            let value = creature.hitDiceCollection.roll(RollMethod.Normal, creature.name)
            Dice.seed(encounter.random())
            return value.results[value.selectedIndex].sum
        } else {
            return creature.healthValue
        }
    }, [creature, card.maxHealth])

    const onNotesChange: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => {
        if (storage.cards && storage.cards.length === encounter.creatures.length) {
            let notes: string = e.currentTarget.value
            let cards: IEncounterCard[] = [...storage.cards.slice(0, index), { ...storage.cards[index], notes: notes }, ...storage.cards.slice(index + 1)]
            dispatch.setStorage("cards", cards)
        }
    }

    const onHealthChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        let value: number = parseInt(e.currentTarget.value)
        let health: number = Math.max(0, isNaN(value) ? card.health : value)
        let cards: IEncounterCard[] = [...storage.cards.slice(0, index), { ...storage.cards[index], health: health }, ...storage.cards.slice(index + 1)]
        dispatch.setStorage("cards", cards)
    }

    const portrait = creature.portrait && creature.portrait.includes("http") 
        ? creature.portrait 
        : '/defaultImage.jpg'

    return (
        <div className={styles.encounterCard} style={{ order: order }}>
            <div className={styles.encounterCardToken} data={num > 0 ? "show" : "hide"}>
                { num }
            </div>
            <Link href={Navigation.fileURL(id)} rel='noopener noreferrer' target="_blank">
                <button className={styles.encounterCardHeader}>
                    <div>{creature.name}</div>
                </button>
            </Link>
            <div className={styles.encounterCardPortrait} >
                <img src={portrait} alt='/defaultImage.jpg'/>
            </div>
            <div className={styles.encounterCardRow}>
                <Elements.Bold>Initiative: </Elements.Bold>
                { `${initiative} (${initiativeBonus >= 0 ? `+${initiativeBonus}` : initiativeBonus})` }
            </div>
            <div className={styles.encounterCardInputRow}>
                <Elements.Bold>HP: </Elements.Bold>
                <input
                    className={styles.encounterCardInput} 
                    type="number" 
                    value={card.health ?? maxHealth}
                    onChange={onHealthChange}/>
                {` / ${maxHealth}`}
            </div>
            <div className={styles.encounterCardRow}>
                <Elements.Bold>AC: </Elements.Bold>
                {creature.acValue}
            </div>
            { rolls.type === "save" &&
                <div className={styles.encounterCardRow}>
                    <Elements.Bold>{`${attrOptions.options[rolls.attr]} Save: `}</Elements.Bold>
                    {Math.max(roll + creature.getSaveModifier(rolls.attr), 0)}
                </div>
            }
            { rolls.type === "check" &&
                <div className={styles.encounterCardRow}>
                    <Elements.Bold>{`${attrOptions.options[rolls.attr]} Check: `}</Elements.Bold>
                    {Math.max(roll + creature.getAttributeModifier(rolls.attr), 0)}
                </div>
            }
            <textarea 
                className={styles.encounterCardTextarea}
                value={card.notes} 
                onChange={onNotesChange}
                placeholder="Input notes here ..."/>
        </div>
    )
}

export const CreatureCard = ({ data, ...rest }: CreatureCardProps): JSX.Element => {
    const [creature] = useCreatureHandler(data)
    return <EncounterCard id={data.id} creature={creature} {...rest}/>
}

export const CharacterCard = ({ data, ...rest }: CreatureCardProps): JSX.Element => {
    const [character] = useCharacterHandler(data)
    return <EncounterCard id={data.id} creature={character} {...rest}/>
}

export default EncounterCard