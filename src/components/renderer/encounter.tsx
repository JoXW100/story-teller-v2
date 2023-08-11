import React, { useContext, useEffect, useState } from 'react';
import Elements from 'data/elements';
import { Context } from 'components/contexts/fileContext';
import { useParser } from 'utils/parser';
import Dice from 'utils/data/dice';
import { useFiles } from 'utils/handlers/files';
import CreatureData from 'data/structures/creature';
import EncounterData from 'data/structures/encounter';
import EncounterCard from './encounterCard';
import { FileData, FileMetadataQueryResult } from 'types/database/files';
import { CalculationMode, RendererObject } from 'types/database/editor';
import ICreatureStats from 'types/database/files/iCreatureStats';
import { IEncounterCardData, EncounterContent, EncounterMetadata, EncounterStorage } from 'types/database/files/encounter';
import { CreatureMetadata } from 'types/database/files/creature';
import { Attribute } from 'types/database/dnd';
import { ObjectId } from 'types/database';
import styles from 'styles/renderer.module.scss';

type EncounterFileRendererProps = React.PropsWithRef<{
    file: FileData<EncounterContent,EncounterMetadata,EncounterStorage>
    stats?: ICreatureStats
}>

type EncounterLinkRendererProps = React.PropsWithRef<{
    file: FileMetadataQueryResult<EncounterMetadata>
    stats?: ICreatureStats
}>

type CardDispatch = React.Dispatch<React.SetStateAction<IEncounterCard[]>>
type CardSortData = {
    card: IEncounterCardData
    index: number
}

interface IEncounterCard extends IEncounterCardData {
    id: ObjectId
    num: number
    creature: CreatureData
}

const cardsAreEqual = (a: IEncounterCardData[], b: IEncounterCardData[]): boolean => {
    if (a.length != b.length) {
        return false
    }

    for (let index = 0; index < a.length; index++) {
        if (a[index].initiative != b[index].initiative
        || a[index].maxHealth != b[index].maxHealth
        || a[index].health != b[index].health
        || a[index].notes != b[index].notes) {
            return false
        }
    }

    return true
}

const useEncounterCards = (file: FileData<EncounterContent,EncounterMetadata,EncounterStorage>): [IEncounterCard[], CardDispatch] => {
    const [_, dispatch] = useContext(Context)
    const [creatures, loading] = useFiles<CreatureMetadata>(file?.metadata?.creatures)
    const [state, setState] = useState<IEncounterCard[]>([])
    const cards = file?.storage?.cards ?? []

    useEffect(() => {
        let counterMap: Record<string, number> = {}
        if (creatures.length !== cards.length) {
            setState(creatures.map((cre) => {
                let creature = new CreatureData(cre.metadata)
                let health = creature.healthValue
                let id = String(cre.id)
                return {
                    id: id,
                    num: counterMap[id] = 1 + (counterMap[id] ?? -1),
                    creature: creature,
                    initiative: 0,
                    maxHealth: health,
                    health: health,
                    notes: ""
                } as IEncounterCard
            }))
        } else {
            setState(creatures.map((cre, index) => {
                let card = cards[index]
                let creature = new CreatureData(cre.metadata)
                let health = card?.health ?? creature.healthValue
                let maxHealth = card?.maxHealth ?? health
                let initiative = card?.initiative ?? 0
                let notes = card?.notes ?? ""
                let id = String(cre.id)
                return {
                    id: id,
                    num: counterMap[id] = 1 + (counterMap[id] ?? -1),
                    creature: creature,
                    initiative: initiative,
                    maxHealth: maxHealth,
                    health: health,
                    notes: notes
                }
            }))
        }
    }, [loading, creatures])

    useEffect(() => {
        if (file.isOwner && !loading && !cardsAreEqual(state, cards)) {
            dispatch.setStorage("cards", state.map((card) => ({
                initiative: card.initiative,
                maxHealth: card.maxHealth,
                health: card.health,
                notes: card.notes
            } as IEncounterCardData)))
        }
    }, [state])
    return [state, setState]
}

const EncounterFileRenderer = ({ file }: EncounterFileRendererProps): JSX.Element => {
    const [cards, setCards] = useEncounterCards(file)
    const encounter = new EncounterData(file.metadata, cards, setCards)
    const content = useParser(file.content.text, file.metadata, "$content")
    const description = useParser(encounter.description, file.metadata, "description")

    const onRollInitiative = () => {
        encounter.cards.forEach((card, index) => {
            card.initiative = new Dice(20).rollOnce() + cards[index].creature.initiativeValue
        })
    }

    const onResetStats = () => {
        encounter.cards.forEach((card) => {
            card.health = card.maxHealth
            card.initiative = 0
            card.notes = ""
        })
    }

    const onRandomizeHealth = () => {
        encounter.cards.forEach((card, index) => {
            let creature = cards[index].creature
            let maxHealth = 0
            switch (creature.health.type) {
                case CalculationMode.Override:
                    maxHealth = creature.health.value ?? 0
                    break
                case CalculationMode.Modify:
                    var sum: number = new Dice(creature.hitDice).rollSum(creature.level)
                    var mod: number = creature.getAttributeModifier(Attribute.CON) * creature.level
                    maxHealth = sum + (creature.health.value ?? 0) + mod
                    break
                case CalculationMode.Auto:
                default:
                    var sum: number = new Dice(creature.hitDice).rollSum(creature.level)
                    var mod: number = creature.getAttributeModifier(Attribute.CON) * creature.level
                    maxHealth = sum + mod
            }
            card.health = card.maxHealth = maxHealth
        })
    }

    const onSetDefaultHealth = () => {
        encounter.cards.forEach((card, index) => {
            card.health = card.maxHealth = cards[index].creature.healthValue
        })
    }

    const sortCards = (a: CardSortData, b: CardSortData): number => {
        let delta = b.card.initiative - a.card.initiative
        return delta != 0 
            ? delta 
            : cards[b.index].creature.initiativeValue - cards[a.index].creature.initiativeValue
    }

    return <>
        <Elements.Header1 options={{ underline: 'true' }}>{encounter.name}</Elements.Header1>
        <Elements.Align>
            <button className={styles.encounterButton} onClick={onRollInitiative}>
                Roll Initiative
            </button>
            <Elements.Space/>
            <button className={styles.encounterButton} onClick={onResetStats}>
                Reset Stats
            </button>
            <Elements.Space/>
            <button className={styles.encounterButton} onClick={onRandomizeHealth}>
                Randomize Health
            </button>
            <Elements.Space/>
            <button className={styles.encounterButton} onClick={onSetDefaultHealth}>
                Set Default Health
            </button>
        </Elements.Align>
        <Elements.Line/>
        { encounter.description && encounter.description.length > 0 && <> 
            <Elements.Header2>Description</Elements.Header2>
            <div>{description}</div>
        </>}
        <Elements.Space/>
        <div><Elements.Bold>Challenge: </Elements.Bold>{encounter.challengeText}</div>
        <Elements.Space/>
        <Elements.Header2 options={{ underline: 'true' }}>Creatures</Elements.Header2>
        <div className={styles.encounterCardHolder}>
            { encounter.cards
                .map((card, index) => ({ card: card, index: index } as CardSortData))
                .sort(sortCards)
                .map((data, index) => (
                    <EncounterCard 
                        key={index} 
                        card={data.card}
                        creature={cards[data.index].creature}
                        id={cards[data.index].id}
                        num={cards[data.index].num}
                    />
                ))
            }
        </div>
        { content && <Elements.Line/> }
        { content }
    </>
}

const EncounterLinkRenderer = ({ file }: EncounterLinkRendererProps): JSX.Element => {
    const encounter = new EncounterData(file.metadata, [], null)
    const description = useParser(encounter.description, file.metadata, `$${file.id}.description`)
    return <>
        <Elements.Header3>{encounter.name}</Elements.Header3>
        {description}
    </>
}

const EncounterRenderer: RendererObject<EncounterContent,EncounterMetadata> = {
    fileRenderer: EncounterFileRenderer,
    linkRenderer: EncounterLinkRenderer
}

export default EncounterRenderer