import { useContext, useEffect, useMemo, useState } from 'react';
import { Context } from 'components/contexts/fileContext';
import { openPopup } from 'components/common/popupHolder';
import SaveRollDialog, { SaveRunData } from './spell/saveRollDialog';
import Elements from 'data/elements';
import EncounterData from 'data/structures/encounter';
import { Attribute } from 'types/database/dnd';
import { CharacterCard, CreatureCard } from './encounterCard';
import { useParser } from 'utils/parser';
import { useDataFiles } from 'utils/handlers/files';
import Dice from 'utils/data/dice';
import Logger from 'utils/logger';
import { RendererObject } from 'types/database/editor';
import ICreatureStats from 'types/database/files/iCreatureStats';
import EncounterFile, { IEncounterMetadata } from 'types/database/files/encounter';
import { FileMetadataQueryResult } from 'types/database/responses';
import { File, FileType } from 'types/database/files';
import styles from 'styles/renderer.module.scss';

type EncounterFileRendererProps = React.PropsWithRef<{
    file: File<EncounterFile>
    stats?: ICreatureStats
}>

type EncounterLinkRendererProps = React.PropsWithRef<{
    file: FileMetadataQueryResult<IEncounterMetadata>
    stats?: ICreatureStats
}>

export interface RollsState extends SaveRunData {
    rolls: number[]
}

const EncounterFileRenderer = ({ file }: EncounterFileRendererProps): JSX.Element => {
    const [_, dispatch] = useContext(Context)
    const encounter = useMemo(() => new EncounterData(file.metadata), [file.metadata])
    const [data] = useDataFiles(encounter.creatures, [FileType.Character, FileType.Creature])
    const [rolls, setRolls] = useState<RollsState>({ type: "none", attr: Attribute.STR, rolls: [] })
    const content = useParser(file.content.text, encounter, "$content")
    const description = useParser(encounter.description, encounter, "description")

    const onReset = () => {
        setRolls({ type: "none", attr: Attribute.STR, rolls: [] })
        dispatch.setStorage("cards", Array.from({ length: encounter.creatures.length }).map(() => {}) )
    }

    const onRollInitiative = () => {
        let dice = new Dice(20)
        dispatch.setStorage("cards", file.storage?.cards?.map((card) => ({ ...card, initiative: dice.rollOnce() })))
    }

    const onRandomizeHealth = () => {
        dispatch.setStorage("cards", file.storage?.cards?.map((card) => ({ ...card, maxHealth: encounter.random(), health: undefined })))
    }

    const onSetDefaultHealth = () => {
        dispatch.setStorage("cards", file.storage?.cards?.map((card) => ({ ...card, maxHealth: undefined, health: undefined })))
    }

    const onSetSaveRoll = () => {
        let dice = new Dice(20)
        openPopup((
            <SaveRollDialog callback={(data) => {
                if (data.type !== "none") {
                    setRolls({ ...data, rolls: Array.from({ length: encounter.creatures.length }).map(() => dice.rollOnce()) })
                }
            }}/>
        ), true)
    }

    useEffect(() => {
        if (data.length > 0 && (!Array.isArray(file.storage?.cards) || file.storage.cards.length !== data.length)) {
            onReset()
        }
    }, [file.storage?.cards, file.metadata?.creatures])

    Logger.log("Encounter", encounter)

    return <>
        <Elements.Header1 options={{ underline: 'true' }}>{encounter.name}</Elements.Header1>
        <Elements.Align>
            <button className={styles.encounterButton} onClick={onReset}>
                Reset
            </button>
            <Elements.Space/>
            <button className={styles.encounterButton} onClick={onRollInitiative}>
                Roll Initiative
            </button>
            <Elements.Space/>
            <button className={styles.encounterButton} onClick={onRandomizeHealth}>
                Roll Health
            </button>
            <Elements.Space/>
            <button className={styles.encounterButton} onClick={onSetDefaultHealth}>
                Set Default Health
            </button>
            <Elements.Space/>
            <button className={styles.encounterButton} onClick={onSetSaveRoll}>
                Roll Save/Check
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
            { data.map((item, index) => {
                const Card = item.type === FileType.Character 
                    ? CharacterCard
                    : CreatureCard
                return (
                    <Card key={index} data={item} index={index} encounter={encounter} storage={file.storage} rolls={rolls}/>
                )
            })}
        </div>
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