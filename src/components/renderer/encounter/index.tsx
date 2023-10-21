import { useContext, useEffect, useMemo, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import { Context } from 'components/contexts/fileContext';
import DropdownMenu from 'components/common/controls/dropdownMenu';
import CollapsibleGroup from 'components/common/collapsibleGroup';
import Elements from 'data/elements';
import EncounterData from 'data/structures/encounter';
import { getOptionType } from 'data/optionData';
import { Attribute } from 'types/database/dnd';
import { CharacterCard, CreatureCard } from './encounterCard';
import SimulatorRenderer from './simulator';
import { DragData } from 'index';
import { useParser } from 'utils/parser';
import { useDataFiles } from 'utils/handlers/files';
import Dice from 'utils/data/dice';
import Logger from 'utils/logger';
import { RendererObject } from 'types/database/editor';
import { EncounterFile, IEncounterCard, IEncounterMetadata } from 'types/database/files/encounter';
import { FileDataQueryResult, FileMetadataQueryResult } from 'types/database/responses';
import { File, FileType } from 'types/database/files';
import styles from 'styles/renderer.module.scss';

type EncounterFileRendererProps = React.PropsWithRef<{
    file: File<EncounterFile>
}>

type EncounterLinkRendererProps = React.PropsWithRef<{
    file: FileMetadataQueryResult<IEncounterMetadata>
}>

export interface RollsState {
    type: "none" | "save" | "check"
    attr: Attribute
    rolls: number[]
}

interface EncounterState {
    open: boolean,
    attr: Attribute
}

interface CreatureGroups {
    grouped: (FileDataQueryResult & { index: number })[][],
    other: (FileDataQueryResult & { index: number })[]
}

const EncounterFileRenderer = ({ file }: EncounterFileRendererProps): JSX.Element => {
    const [_, dispatch] = useContext(Context)
    const encounter = useMemo(() => new EncounterData(file.metadata), [file.metadata])
    const [data] = useDataFiles(encounter.creatures, [FileType.Character, FileType.Creature])
    const [rolls, setRolls] = useState<RollsState>({ type: "none", attr: null, rolls: [] })
    const [state, setState] = useState<EncounterState>({ open: false, attr: null })
    const [simulator, setSimulator] = useState<boolean>(false)

    const groupedCreatures = useMemo<CreatureGroups>(() => {
        return data.reduce<CreatureGroups>((prev, creature, index) => {
            let groupId = file.storage?.cards?.[index]?.group
            if (!isNaN(groupId) && file.storage.groups?.length > groupId) {
                let grouped = prev.grouped ?? []
                grouped[groupId] = [...grouped[groupId] ?? [], { ...creature, index: index }]
                return {...prev, grouped: grouped}
            } else {
                return {...prev, other: [...prev.other, { ...creature, index: index }]}
            }
        }, { grouped: [], other: []})
    }, [data, file.storage?.cards, file.storage?.groups, encounter])

    const attr = state.attr ?? getOptionType("attr").default
    const content = useParser(file.content.text, encounter, "$content")
    const description = useParser(encounter.description, encounter, "description")

    const onReset = () => {
        setRolls({ type: "none", attr: Attribute.STR, rolls: [] })
        setSimulator(false)
        dispatch.setStorage("cards", Array.from({ length: encounter.creatures?.length ?? 0 }).map((_, index) => ({ group: file.storage.cards?.[index]?.group })) )
    }

    const onRollInitiative = () => {
        let dice = new Dice(20)
        dispatch.setStorage("cards", file.storage?.cards?.map((card) => ({ ...card, initiative: dice.rollOnce() })))
    }

    const onRandomizeHealth = () => {
        dispatch.setStorage("cards", file.storage?.cards?.map((card) => ({ ...card, maxHealth: encounter.random(), health: undefined })))
    }

    const onSimulateBattle = () => {
        let dice = new Dice(20)
        dispatch.setStorage("cards", file.storage?.cards?.map((card) => ({ initiative: dice.rollOnce(), group: card.group })))
        setState({ open: false, attr: null })
        setSimulator(true)
    }

    const onOpenSaveRollPanel = () => {
        setState({ ...state, open: !state.open })
    }

    const onAttrDropdownChange = (value: Attribute) => {
        setState({ ...state, attr: value })
    }

    const onRollSaves = () => {
        let dice = new Dice(20)
        setRolls({ type: "save", attr: attr, rolls: Array.from({ length: encounter.creatures.length }).map(() => dice.rollOnce()) })
        setState({ ...state, open: false, attr: null  })
    }

    const onRollChecks = () => {
        let dice = new Dice(20)
        setRolls({ type: "check", attr: attr, rolls: Array.from({ length: encounter.creatures.length }).map(() => dice.rollOnce()) })
        setState({ ...state, open: false, attr: null })
    }

    const handleAddGroup = () => {
        dispatch.setStorage("groups", [...file.storage?.groups ?? [], "Group Name..."])
    }

    const handleRemoveGroup = (index: number) => {
        let groups = file.storage?.groups ?? []
        dispatch.setStorage("cards", file.storage.cards?.map((card) => ({ ...card, group: card.group === index ? undefined : card.group })))
        dispatch.setStorage("groups", [...groups.slice(0, index), ...groups.slice(index + 1)])
    }

    const handleRenameGroup = (name: string, index: number) => {
        let groups = file.storage?.groups ?? []
        dispatch.setStorage("groups", [...groups.slice(0, index), name, ...groups.slice(index + 1)])
    }

    const handleDrag = (dragData: DragData, index: number): boolean => {
        let res = !isNaN(dragData?.cardIndex)
            && file.storage.cards[dragData.cardIndex]?.group !== index
        return res
    }

    const handleDrop = (dragData: DragData, index: number) => {
        let cards = file.storage?.cards ?? []
        let card = dragData.cardIndex
        let newCard: IEncounterCard = {...cards[card], group: index  }
        dispatch.setStorage("cards", [...cards.slice(0, card), newCard, ...cards.slice(card + 1)])
        dragData.cardIndex = null
    }

    useEffect(() => {
        if (data.length > 0 && (!Array.isArray(file.storage?.cards) || file.storage.cards.length !== data.length)) {
            onReset()
        }
    }, [file.storage?.cards, file.metadata?.creatures])

    Logger.log("Encounter", encounter, file.storage)

    return <>
        <Elements.Header1 options={{ underline: 'true' }}>{encounter.name}</Elements.Header1>
        <Elements.Align>
            <button className={styles.encounterButton} onClick={onReset}>
                Reset
            </button>
            <Elements.Space/>
            <button className={styles.encounterButton} onClick={onRollInitiative} disabled={simulator || data.length === 0}>
                Roll Initiative
            </button>
            <Elements.Space/>
            <button className={styles.encounterButton} onClick={onRandomizeHealth} disabled={simulator || data.length === 0}>
                Roll Health
            </button>
            <Elements.Space/>
            <button className={styles.encounterButton} onClick={onSimulateBattle} disabled={simulator || data.length === 0}>
                Simulate Battle
            </button>
            <Elements.Space/>
            <div className={styles.encounterCollapsedButtonHolder}>
                <button className={styles.encounterButton} onClick={onOpenSaveRollPanel} disabled={simulator || data.length === 0}>
                    Roll Save/Check
                </button>
                <div data={String(state.open)}>
                    <DropdownMenu 
                        value={attr} 
                        values={getOptionType("attr").options} 
                        onChange={onAttrDropdownChange} 
                        itemClassName={styles.dropdownItem}/>
                    <button onClick={onRollSaves}>
                        Roll Saves
                    </button>
                    <button onClick={onRollChecks}>
                        Roll Checks
                    </button>
                </div>
            </div>
        </Elements.Align>
        <Elements.Line/>
        { encounter.description && encounter.description.length > 0 && <> 
            <Elements.Header2>Description</Elements.Header2>
            <div>{description}</div>
        </>}
        <Elements.Space/>
        <div><Elements.Bold>Challenge: </Elements.Bold>{encounter.challengeText}</div>
        <Elements.Line/>
        <Elements.Align>
            { simulator && <SimulatorRenderer creatures={data} data={file.storage.cards}/> }
            <Elements.Block options={{ weight: "4" }}>
                { groupedCreatures.other?.length > 0 &&
                    <>
                        <div className={styles.encounterCardHolder} data={String(simulator)}>
                            { groupedCreatures.other.map((item, index) => {
                                const Card = item.type === FileType.Character 
                                    ? CharacterCard
                                    : CreatureCard
                                return (
                                    <Card 
                                        key={index} 
                                        data={item}
                                        index={item.index} 
                                        encounter={encounter} 
                                        storage={file.storage} 
                                        rolls={rolls}/>
                                )
                            })}
                        </div>
                        <Elements.Space/>
                    </>
                }{ file.storage.groups?.map((group, index) => (
                    <CollapsibleGroup 
                        key={index} 
                        header={group} 
                        onDrag={(data) => handleDrag(data, index)}
                        onDrop={(data) => handleDrop(data, index)}
                        onChange={(value) => handleRenameGroup(value, index)} 
                        onRemove={() => handleRemoveGroup(index)}>
                        <div className={styles.encounterCardHolder} data={String(simulator)}>
                            { groupedCreatures.grouped[index]?.map((item, index) => {
                                const Card = item.type === FileType.Character 
                                    ? CharacterCard
                                    : CreatureCard
                                return (
                                    <Card 
                                        key={index} 
                                        data={item} 
                                        index={item.index} 
                                        encounter={encounter} 
                                        storage={file.storage} 
                                        rolls={rolls}/>
                                )
                            })}
                        </div>
                    </CollapsibleGroup>
                ))}
            </Elements.Block>
        </Elements.Align>
        <Elements.Space/>
        <button className={styles.encounterAddGroupButton} tooltips='Create New Group' onClick={handleAddGroup} disabled={simulator}>
            <AddIcon/>
        </button>
        { content && <Elements.Line/> }
        { content }
    </>
}

const EncounterLinkRenderer = ({ file }: EncounterLinkRendererProps): JSX.Element => {
    const encounter = new EncounterData(file.metadata)
    const description = useParser(encounter.description, file.metadata, `$${file.id}.description`)
    return <>
        <Elements.Header3>{encounter.name}</Elements.Header3>
        {description}
    </>
}

const EncounterRenderer: RendererObject<EncounterFile> = {
    fileRenderer: EncounterFileRenderer,
    linkRenderer: EncounterLinkRenderer
}

export default EncounterRenderer