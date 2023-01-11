import React, { useEffect, useState } from 'react';
import Elements from 'elements';
import { useParser } from 'utils/parser';
import Dice from 'utils/data/dice';
import CreatureData from 'structures/creature';
import EncounterCardData from 'structures/encounterCardData';
import EncounterData from 'structures/encounter';
import { FileData, FileGetMetadataResult, FileMetadataQueryResult } from 'types/database/files';
import { CalculationMode, RendererObject } from 'types/database/editor';
import ICreatureStats from 'types/database/files/iCreatureStats';
import { IEncounterCardData, EncounterContent, EncounterMetadata } from 'types/database/files/encounter';
import { useFiles } from 'utils/handlers/files';
import { CreatureMetadata } from 'types/database/files/creature';
import { Attribute } from 'types/database/dnd';
import styles from 'styles/renderer.module.scss';

type EncounterFileRendererProps = React.PropsWithRef<{
    file: FileData<EncounterContent,EncounterMetadata>
    stats?: ICreatureStats
}>

type EncounterLinkRendererProps = React.PropsWithRef<{
    file: FileMetadataQueryResult<EncounterMetadata>
    stats?: ICreatureStats
}>

type EncounterCardProps = React.PropsWithRef<{
    file: FileMetadataQueryResult<CreatureMetadata>,
    data?: IEncounterCardData,
    num?: number
}>

interface EncounterCardSortingData { 
    index: number, 
    creature: FileGetMetadataResult<CreatureMetadata>, 
    num: number 
}

const EncounterFileRenderer = ({ file }: EncounterFileRendererProps): JSX.Element => {
    const encounter = new EncounterData(file.metadata)
    const [cardData, setCardData] = useState(encounter.data)
    const creatures = useFiles<CreatureMetadata>(encounter.creatures)
    const content = useParser(file.content.text, file.metadata)

    const onRollInitiative = () => {
        creatures.forEach((file, index) => {
            let card = encounter.getData(index)
            let creature = new CreatureData(file.metadata)
            card.initiative = new Dice(20).rollOnce() + creature.initiativeValue
        })
        setCardData([...cardData])
    }

    const onResetStats = () => {
        cardData.forEach((card) => {
            card.health = card.maxHealth
            card.initiative = 0
            card.notes = ""
        })
        setCardData([...cardData])
    }

    const onRandomizeHealth = () => {
        creatures.forEach((file, index) => {
            let card = encounter.getData(index)
            let creature = new CreatureData(file.metadata)
            let value = creature.health?.value ?? 0
            let maxHealth = 0
            switch (creature.health.type) {
                case CalculationMode.Override:
                    maxHealth = value
                    break
                case CalculationMode.Modify:
                    var sum: number = new Dice(creature.hitDice).rollSum(creature.level)
                    var mod: number = creature.getAttributeModifier(Attribute.CON) * creature.level
                    maxHealth = sum + value + mod
                    break
                case CalculationMode.Auto:
                default:
                    var sum: number = new Dice(creature.hitDice).rollSum(creature.level)
                    var mod: number = creature.getAttributeModifier(Attribute.CON) * creature.level
                    maxHealth = sum + mod
            }
            card.health = card.maxHealth = maxHealth
        })
        setCardData([...cardData])
    }

    const onSetDefaultHealth = () => {
        creatures.forEach((file, index) => {
            let card = encounter.getData(index)
            let creature = new CreatureData(file.metadata)
            card.health = card.maxHealth = creature.healthValue
        })
        setCardData([...cardData])
    }

    const sortCards = (a: EncounterCardSortingData, b: EncounterCardSortingData): number => {
        let delta = encounter.getData(b.index).initiative - encounter.getData(a.index).initiative
        if (delta != 0) {
            return delta
        }
        let creatureA = new CreatureData(a.creature.metadata);
        let creatureB = new CreatureData(b.creature.metadata);
        return creatureB.initiativeValue - creatureA.initiativeValue;
    }

    useEffect(() => {
        creatures.forEach((file, index) => {
            let card = encounter.getData(index)
            let creature = new CreatureData(file.metadata)
            card.health = card.maxHealth = creature.healthValue
        })
        setCardData(creatures.map((file) => {
            let creature = new CreatureData(file.metadata)
            var health = creature.healthValue
            return {
                initiative: creature.initiativeValue,
                maxHealth: health,
                health: health,
                notes: ""
            } as IEncounterCardData
        }))
    }, [creatures])

    let creatureCounterMap: { [key:string]: number } = {}

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
        <Elements.Header2>Description</Elements.Header2>
        <div>{encounter.description}</div>
        <Elements.Header2>Details</Elements.Header2>
        <div><Elements.Bold>Challenge: </Elements.Bold>{encounter.challengeText}</div>
        <Elements.Space/>
        <Elements.Header2 options={{ underline: 'true' }}>Creatures</Elements.Header2>
        <div className={styles.encounterCardHolder}>
            { creatures
                .map((c, index) => ({ index: index, creature: c, num: creatureCounterMap[String(c.id)] = 1 + (creatureCounterMap[String(c.id)] ?? -1) }))
                .sort(sortCards)
                .map((file) => (
                    <EncounterCard 
                        key={file.index} 
                        file={file.creature} 
                        data={encounter.getData(file.index)}
                        num={file.num} 
                    />
                )
            )}
        </div>
        { content && <Elements.Line/> }
        { content }
    </>
}

const EncounterLinkRenderer = ({ file }: EncounterLinkRendererProps): JSX.Element => {
    const encounter = new EncounterData(file.metadata)
    console.log("EncounterLinkRenderer", encounter)
    return <>
        <Elements.Header3>{encounter.name}</Elements.Header3>
        { encounter.description }
    </>
}

const EncounterRenderer: RendererObject<EncounterContent,EncounterMetadata> = {
    fileRenderer: EncounterFileRenderer,
    linkRenderer: EncounterLinkRenderer
}

const EncounterCard = ({ file, data, num }: EncounterCardProps): JSX.Element => {
    let creature = new CreatureData(file.metadata);
    let card = new EncounterCardData(data)
    let initiative = creature.initiativeValue
    const [notes, setNotes] = useState(card.notes)
    const [health, setHealth] = useState(card.health)

    const onChange: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => {
        card.notes = e.currentTarget.value
        setNotes(card.notes)
    }

    const onHealthChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        var value = parseInt(e.currentTarget.value)
        card.health = Math.max(0, Math.min(isNaN(value) ? card.health : value, card.maxHealth))
        setHealth(card.health)
    } 

    useEffect(() => {
        setNotes(card.notes)
    }, [card.notes])

    useEffect(() => {
        setHealth(card.health)
    }, [card.health])

    return (
        <div>
            <Elements.Box>
                <Elements.Header3 options={{ underline: 'true' }}>
                    { num > 0 ? `${creature.name} (${num})` : creature.name}
                </Elements.Header3>
                <Elements.Link options={{ href: String(file.id) }}>
                    <Elements.Image options={{ href: creature.portrait }}/>
                </Elements.Link>
                <Elements.Line/>
                <div>
                    <Elements.Bold>Initiative: </Elements.Bold>
                    { `${card.initiative} (${initiative >= 0 ? `+${initiative}` : initiative})` }
                </div>
                <div>
                    <Elements.Bold>HP: </Elements.Bold>
                    <input
                        className={styles.encounterCardInput} 
                        type="number" 
                        value={health}
                        onChange={onHealthChange}
                    />
                    {` / ${card.maxHealth}`}
                </div>
                <div>
                    <Elements.Bold>Notes: </Elements.Bold>
                    <textarea 
                        className={styles.encounterCardTextarea}
                        value={notes} 
                        onChange={onChange}
                        placeholder={"Input notes here ..."}
                    />
                </div>
            </Elements.Box>
        </div>
    )
}

export default EncounterRenderer