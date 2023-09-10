import { useContext, useEffect, useMemo, useState } from 'react';
import { Context } from 'components/contexts/fileContext';
import Elements from 'data/elements';
import Simulator, { SimulationAttackData, SimulatorCreatureState } from 'data/structures/simulator';
import { useFiles } from 'utils/handlers/files';
import useCreaturesHandler from 'utils/handlers/creaturesHandler';
import { IEncounterCard } from 'types/database/files/encounter';
import { FileGetManyDataResult } from 'types/database/responses';
import { FileType } from 'types/database/files';
import { ISpellMetadata } from 'types/database/files/spell';
import styles from 'styles/renderer.module.scss';

type SimulatorRendererProps = React.PropsWithRef<{
    creatures: FileGetManyDataResult 
    data: IEncounterCard[]
}>

const SimulatorRenderer = ({ creatures, data }: SimulatorRendererProps): JSX.Element => {
    const [_, dispatch] = useContext(Context)
    const [turnOrder, setTurnOrder] = useState<SimulatorCreatureState[]>([])
    const [actionHistory, setActionHistory] = useState<SimulationAttackData[]>([])
    const [creatureData, abilityRecord] = useCreaturesHandler(creatures)
    const spellIds = useMemo(() => creatureData.flatMap((creature) => creature.metadata?.spells ?? []), [creatureData])
    const [spells] = useFiles(spellIds, [FileType.Spell])

    const simulator = useMemo(() => {
        const spellRecord = spells.reduce<Record<string, ISpellMetadata>>((prev, spell) => (
            {...prev, [String(spell.id)]: spell.metadata }
        ), {})
        console.log("simulator.creatureData", creatureData)
        console.log("simulator.abilityRecord", abilityRecord)
        return new Simulator(creatureData, abilityRecord, spellRecord)
    }, [creatureData, abilityRecord, spells])

    const handleSimulateTurn = () => {
        let result = simulator.simulateTurn(turnOrder)
        switch (result.type) {
            case "attack":
                let newData = [...data]
                for (const attack of result.attacks) {
                    if (attack.isHit) {
                        newData[attack.target.identifier].health = Math.max(0, (newData[attack.target.identifier].health ?? attack.target.data.health) - attack.total)
                    }
                }
                dispatch.setStorage("cards", newData)
            default:
                break;
        }
        setActionHistory(result.attacks ?? [])
        setTurnOrder(simulator.getTurnOrder(data))
    }
    useEffect(() => {
        setTurnOrder(simulator.getTurnOrder(data))
    }, [simulator, data])

    return <>
        <Elements.Block>
            <Elements.Align>
                <button className={styles.encounterButton} onClick={handleSimulateTurn}>
                    Simulate Turn
                </button>
            </Elements.Align>
            { turnOrder.map((entry, index) => (
                <div key={index} className={styles.encounterTurnOrderEntry} data={String(index == 0 || turnOrder[index - 1].order < entry.order)}>
                    <div className={styles.encounterCardPortrait}>
                        <img src={entry.creature.portrait} alt='/defaultImage.jpg' draggable={false}/>
                        <div className={styles.encounterInitiativeCounter}>
                            <b>{entry.initiative}</b>
                        </div>
                    </div>
                    <b>{entry.creature.name}</b>
                </div>
            ))}
            <Elements.Line/>
            { actionHistory.map((entry, index) => (
                <div key={index}>
                    <span>{`${entry.active.creature.name} Attacks ${entry.target.creature.name} with ${entry.data.name} (${entry.hit.results[entry.hit.selectedIndex].sum + entry.hit.modifier}): ${entry.isHit ? `HIT! for ${entry.total} damage` : "MISS!"}`}</span>
                </div>
            ))}
        </Elements.Block>
        <Elements.Line/>
    </>
}

export default SimulatorRenderer