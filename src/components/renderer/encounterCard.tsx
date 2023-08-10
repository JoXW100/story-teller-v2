import React from 'react';
import Elements from 'data/elements';
import { IEncounterCardData } from 'types/database/files/encounter';
import { CreatureMetadata } from 'types/database/files/creature';
import { ObjectId } from 'types/database';
import styles from 'styles/renderer.module.scss';
import Link from 'next/link';
import Navigation from 'utils/navigation';


type EncounterCardProps = React.PropsWithRef<{
    card?: IEncounterCardData,
    creature?: CreatureMetadata,
    id: ObjectId,
    num: number
}>

const EncounterCard = ({ card, creature, id, num }: EncounterCardProps): JSX.Element => {
    let initiative = creature.initiativeValue

    const onNotesChange: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => {
        card.notes = e.currentTarget.value
    }

    const onHealthChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        let value = parseInt(e.currentTarget.value)
        card.health = Math.max(0, isNaN(value) ? card.health : value)
    }

    const portrait = creature.portrait && creature.portrait.includes("http") 
        ? creature.portrait 
        : '/defaultImage.jpg'

    return (
        <div className={styles.encounterCard}>
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
                { `${card.initiative} (${initiative >= 0 ? `+${initiative}` : initiative})` }
            </div>
            <div className={styles.encounterCardInputRow}>
                <Elements.Bold>HP: </Elements.Bold>
                <input
                    className={styles.encounterCardInput} 
                    type="number" 
                    value={card.health}
                    onChange={onHealthChange}/>
                {` / ${card.maxHealth}`}
            </div>
            <div className={styles.encounterCardRow}>
                <Elements.Bold>AC: </Elements.Bold>
                {creature.acValue}
            </div>
            <textarea 
                className={styles.encounterCardTextarea}
                value={card.notes} 
                onChange={onNotesChange}
                placeholder={"Input notes here ..."}
            />
        </div>
    )
}

export default EncounterCard