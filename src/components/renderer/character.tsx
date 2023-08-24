import React, { useContext, useMemo, useState } from 'react';
import RemoveIcon from '@mui/icons-material/Remove';
import PrepareIcon from '@mui/icons-material/ImportContactsSharp';
import DropdownMenu from 'components/common/controls/dropdownMenu';
import LinkDropdownMenu from 'components/common/controls/linkDropdownMenu';
import LinkInput from 'components/common/controls/linkInput';
import { Context } from 'components/contexts/fileContext';
import CollapsibleGroup from 'components/common/collapsibleGroup';
import { useParser } from 'utils/parser';
import Localization from 'utils/localization';
import { useFile, useFiles } from 'utils/handlers/files';
import Communication from 'utils/communication';
import { AbilityGroups } from './ability';
import { SpellGroups } from './spell';
import { AttributesBox, ProficienciesPage } from './creature';
import Elements from 'data/elements';
import RollElement from 'data/elements/roll';
import CharacterData from 'data/structures/character';
import AbilityData from 'data/structures/ability';
import ModifierCollectionData from 'data/structures/modifierCollection';
import ClassData from 'data/structures/class';
import SpellData from 'data/structures/spell';
import { getOptionType } from 'data/optionData';
import Logger from 'utils/logger';
import CharacterFile, { ICharacterAbilityStorageData, ICharacterMetadata, ICharacterStorage } from 'types/database/files/character';
import { FileGetManyMetadataResult, FileMetadataQueryResult } from 'types/database/responses';
import { IClassMetadata } from 'types/database/files/class';
import { OptionalAttribute } from 'types/database/dnd';
import { RendererObject } from 'types/database/editor';
import { ChoiceChoiceData, EnumChoiceData, IModifierCollection } from 'types/database/files/modifierCollection';
import { IAbilityMetadata } from 'types/database/files/ability';
import { FileContextDispatch } from 'types/context/fileContext';
import { ObjectId } from 'types/database';
import { FileType } from 'types/database/files';
import { ISpellMetadata } from 'types/database/files/spell';
import styles from 'styles/renderer.module.scss';

type CharacterFileRendererProps = React.PropsWithRef<{
    file: CharacterFile
}>

type CharacterLinkRendererProps = React.PropsWithRef<{
    file: FileMetadataQueryResult<ICharacterMetadata>
}>

type CharacterBackgroundPageProps = React.PropsWithRef<{
    character: CharacterData 
    appearance: JSX.Element 
    description: JSX.Element  
    history: JSX.Element 
    notes: JSX.Element
}>

type CharacterClassPageProps = React.PropsWithRef<{
    character: CharacterData 
    classData: ClassData
    setStorage: FileContextDispatch["setStorage"]
}>

type CharacterSpellPageProps = React.PropsWithRef<{
    character: CharacterData 
    storage: ICharacterStorage
    setStorage: FileContextDispatch["setStorage"]
}>


const CharacterFileRenderer = (props: CharacterFileRendererProps): JSX.Element => {
    const Renderer = props.file?.metadata?.simple ?? false
        ? SimpleCharacterRenderer
        : DetailedCharacterRenderer

    return <Renderer {...props}/>
}

const SimpleCharacterRenderer = ({ file }: CharacterFileRendererProps): JSX.Element => {
    const character = useMemo(() => new CharacterData(file.metadata, null), [file.metadata])
    const content = useParser(file.content.text, character, "$content");
    const appearance = useParser(character.appearance, character, "appearance")
    const description = useParser(character.description, character, "description")
    Logger.log("SimpleCharacterRenderer", character)
    return (
        <>
            <Elements.Align>
                <Elements.Block>
                    <Elements.Header1> {character.name} </Elements.Header1>
                    {`${character.sizeText} ${character.typeText}, ${character.alignmentText}`}
                    <Elements.Line/>
                    <Elements.Image options={{href: character.portrait}}/>
                </Elements.Block>
                <Elements.Line/>
                <Elements.Block>
                    <div><Elements.Bold>Race </Elements.Bold>{character.raceText}</div>
                    <div><Elements.Bold>Gender </Elements.Bold>{character.genderText}</div>
                    <div><Elements.Bold>Age </Elements.Bold>{character.age}</div>
                    <div><Elements.Bold>Height </Elements.Bold>{character.height}</div>
                    <div><Elements.Bold>Weight </Elements.Bold>{character.weight}</div>
                    <div><Elements.Bold>Occupation </Elements.Bold>{character.occupation}</div>
                    { character.appearance.length > 0 ? <>
                        <Elements.Line/>
                        <Elements.Header3>Appearance</Elements.Header3>
                        {appearance}
                    </> : null }
                    { character.description.length > 0 ? <>
                        <Elements.Line/>
                        <Elements.Header3>Description</Elements.Header3>
                        {description}
                    </> : null }
                </Elements.Block>
            </Elements.Align>
            {content && <Elements.Line/>}
            {content}
        </>
    )
} 

const DetailedCharacterRenderer = ({ file }: CharacterFileRendererProps): JSX.Element => {
    const [_, dispatch] = useContext(Context)
    const [modifiers, setModifiers] = useState<IModifierCollection>(null)
    const [page, setPage] = useState<typeof Pages[number]>("Background")
    const [classFile] = useFile<IClassMetadata>(file.metadata?.classFile)
    const [subclassFile] = useFile<IClassMetadata>(file.storage?.classData?.$subclass);

    const classData = useMemo(() => new ClassData(classFile?.metadata, file.storage, classFile?.id ? String(classFile?.id) : undefined), [classFile, file.storage])
    const subclassData = useMemo(() => new ClassData(classData.subclasses.includes(subclassFile?.id) ? subclassFile?.metadata : null, file.storage, subclassFile?.id ? String(subclassFile?.id) : undefined), [subclassFile, classData])
    const character =  useMemo(() => new CharacterData(file.metadata, modifiers, classData, subclassData), [file.metadata, modifiers, classData, subclassData])
    const abilities = useMemo(() => character.abilities, [character])
    const spells = useMemo(() => character.spells, [character])
    const stats = useMemo(() => character.getStats(), [character])
    const values = useMemo(() => character.getValues(), [character])

    const content = useParser(file.content.text, character, "$content");
    const appearance = useParser(character.appearance, character, "appearance")
    const description = useParser(character.description, character, "description")
    const history = useParser(character.history, character, "history")
    const notes = useParser(character.notes, character, "notes")

    const Pages = [
        "Background", 
        "Proficiencies", 
        character.spellAttribute !== OptionalAttribute.None && character.classFile ? "Spells" : null, 
        character.classFile ? "Class" : null]

    const expendedAbilityCharges = Object.keys(file.storage?.abilityData ?? {}).reduce<Record<string,number>>((prev, value) => (
        { ...prev, [value]: file.storage.abilityData[value].expendedCharges ?? 0 }
    ), {})
    const expendedSpellSlots = file.storage?.spellData ?? []

    const handleAbilitiesLoaded = (abilities: FileGetManyMetadataResult<IAbilityMetadata>) => {
        let modifiersList = abilities.flatMap((ability) => new AbilityData(ability.metadata, null, String(ability.id)).modifiers);
        let collection = new ModifierCollectionData(modifiersList, file.storage)
        if (!collection.equals(modifiers)) {
            setModifiers(collection);
        }
    }

    const handleSetExpendedAbilityCharges = (value: Record<string, number>) => {
        let data = Object.keys(value).reduce<Record<string,ICharacterAbilityStorageData>>((prev, key) => (
            abilities.includes(key)
            ? { ...prev, [key]: { ...file.storage.abilityData[key], expendedCharges: value[key] }} 
            : prev
        ), {})
        dispatch.setStorage("abilityData", data)
    }

    const handleSetExpendedSpellSlots = (value: number[]) => {
        dispatch.setStorage("spellData", value)
    }

    Logger.log("DetailedCharacterRenderer", character)

    return (
        <>
            <Elements.Align>
                <Elements.Block>
                    <Elements.Header1>{character.name}</Elements.Header1>
                    <Elements.Line/>
                    <div className={styles.pageSelector}>
                        { Object.values(Pages).filter(x => x !== null).map((p, index) => (
                            <button key={index} disabled={page === p} onClick={() => setPage(p)}>
                                {p}
                            </button>
                        ))}
                    </div>
                    <Elements.Line/>
                    <div className={styles.pageItem} data={page === "Background" ? "show" : "hide"}>
                        <CharacterBackgroundPage
                            character={character}
                            appearance={appearance}
                            description={description}
                            history={history}
                            notes={notes} />
                    </div>
                    <div className={styles.pageItem} data={page === "Proficiencies" ? "show" : "hide"}>
                        <ProficienciesPage data={character}/>
                    </div>
                    <div className={styles.pageItem} data={page === "Spells" ? "show" : "hide"}>
                        <CharacterSpellPage 
                            character={character} 
                            storage={file.storage} 
                            setStorage={dispatch.setStorage}/>
                    </div>
                    <div className={styles.pageItem} data={page === "Class" ? "show" : "hide"}>
                        <CharacterClassPage 
                            character={character} 
                            classData={classData} 
                            setStorage={dispatch.setStorage}/>
                    </div>
                </Elements.Block>
                <Elements.Line/>
                <Elements.Block>
                    <AttributesBox data={character}/>
                    <Elements.Line/>
                    <div><Elements.Bold>Armor Class </Elements.Bold>{character.acValue}</div>
                    <div><Elements.Bold>Hit Points </Elements.Bold>
                        {`${character.healthValue} `}
                        <Elements.Roll options={character.healthRoll}/>
                    </div>
                    <div>
                        <Elements.Bold>Initiative </Elements.Bold>
                        <Elements.Roll options={{ 
                            mod: character.initiativeValue.toString(), 
                            desc: "Initiative" 
                        }}/>
                    </div>
                    <div><Elements.Bold>Proficiency Bonus </Elements.Bold>
                        <RollElement options={{ 
                            mod: String(character.proficiencyValue), 
                            desc: "Proficiency Check"
                        }}/>
                    </div>
                    <Elements.Space/>
                    { character.resistances.length > 0 && 
                        <div>
                            <Elements.Bold>Resistances </Elements.Bold>
                            {character.resistances}
                        </div> 
                    }{ character.advantages.length > 0 && 
                        <div><Elements.Bold>Advantages </Elements.Bold>
                            {character.advantages}
                        </div> 
                    }{ character.vulnerabilities.length > 0 && 
                        <div><Elements.Bold>Vulnerabilities </Elements.Bold>
                            {character.vulnerabilities}
                        </div>
                    }{ character.dmgImmunities.length > 0 && 
                        <div><Elements.Bold>DMG Immunities </Elements.Bold>
                            {character.dmgImmunities}
                        </div>
                    }{ character.conImmunities.length > 0 && 
                        <div><Elements.Bold>COND Immunities </Elements.Bold>
                            {character.conImmunities}
                        </div>
                    }
                    <div><Elements.Bold>Speed </Elements.Bold>{character.speedAsText}</div>
                    { Object.keys(character.senses).length > 0 &&
                        <div><Elements.Bold>Senses </Elements.Bold>
                            {character.sensesAsText}
                        </div>
                    }
                    <Elements.Space/>
                    <div><Elements.Bold>Passive Perception: </Elements.Bold>{character.passivePerceptionValue.toString()}</div>
                    <div><Elements.Bold>Passive Investigation: </Elements.Bold>{character.passiveInvestigationValue.toString()}</div>
                    <div><Elements.Bold>Passive Insight: </Elements.Bold>{character.passiveInsightValue.toString()}</div>
                    <Elements.Line/>
                    <AbilityGroups 
                        abilityIds={abilities} 
                        stats={stats}
                        expendedCharges={expendedAbilityCharges}
                        setExpendedCharges={handleSetExpendedAbilityCharges}
                        onLoaded={handleAbilitiesLoaded}
                        values={values}/>
                </Elements.Block>
            </Elements.Align>
            { character.spellAttribute !== OptionalAttribute.None &&
                <>
                    <Elements.Line options={{ width: '3px'}}/>
                    <Elements.Align>
                            <Elements.Align options={{ weight: '3.6' }}>
                                <Elements.Header2> Spells: </Elements.Header2>
                            </Elements.Align>
                            <Elements.Align options={{ direction: 'vc' }}>
                                <Elements.Bold>Spell Modifier</Elements.Bold>
                                <Elements.Roll options={{ 
                                    mod: character.getAttributeModifier(stats.spellAttribute).toString(), 
                                    desc: Localization.toText('spell-spellModifier')
                                }}/>
                            </Elements.Align>
                            <Elements.Space/>
                            <Elements.Align options={{ direction: 'vc' }}>
                                <Elements.Bold>Spell Attack</Elements.Bold>
                                <Elements.Roll options={{ 
                                    mod: character.spellAttackModifier.toString(), 
                                    desc: Localization.toText('spell-spellAttack')
                                }}/>
                            </Elements.Align>
                            <Elements.Space/>
                            <Elements.Align options={{ direction: 'vc' }}>
                                <Elements.Bold>Spell Save</Elements.Bold>
                                <Elements.Save options={{
                                    dc: character.spellSaveModifier.toString()
                                }}/>
                            </Elements.Align>
                    </Elements.Align>
                    <SpellGroups 
                        spellIds={spells} 
                        spellSlots={character.spellSlots} 
                        expendedSlots={expendedSpellSlots}
                        setExpendedSlots={handleSetExpendedSpellSlots}
                        stats={stats}/>
                </>
            }  
            {content && <Elements.Line/>}
            {content}
        </>
    )
}

const CharacterBackgroundPage = ({ character, appearance, description, history, notes }: CharacterBackgroundPageProps): JSX.Element => {
    return (
        <>
            {`${character.sizeText} ${character.typeText}, ${character.alignmentText}, ${character.characterClass.name}`}
            <Elements.Line/>
            <Elements.Image options={{href: character.portrait}}/>
            <Elements.Line/>
            <div><Elements.Bold>Race </Elements.Bold>{character.raceText}</div>
            <div><Elements.Bold>Gender </Elements.Bold>{character.genderText}</div>
            <div><Elements.Bold>Age </Elements.Bold>{character.age}</div>
            <div><Elements.Bold>Height </Elements.Bold>{character.height}</div>
            <div><Elements.Bold>Weight </Elements.Bold>{character.weight}</div>
            <div><Elements.Bold>Occupation </Elements.Bold>{character.occupation}</div>
            { character.appearance.length > 0 ? <>
                <Elements.Line/>
                <Elements.Header3>Appearance</Elements.Header3>
                {appearance}
            </> : null }
            { character.description.length > 0 ? <>
                <Elements.Line/>
                <Elements.Header3>Description</Elements.Header3>
                {description}
            </> : null }
            { character.history.length > 0 ? <>
                <Elements.Line/>
                <Elements.Header3>History</Elements.Header3>
                {history}
            </> : null }
            { character.notes.length > 0 ? <>
                <Elements.Line/>
                <Elements.Header3>Notes</Elements.Header3>
                {notes}
            </> : null }
        </>
    )
}

const CharacterSpellPage = ({ character, storage, setStorage }: CharacterSpellPageProps): JSX.Element => {
    const [cantrips] = useFiles<ISpellMetadata>(storage.cantrips)
    const [spells] = useFiles<ISpellMetadata>(storage.learnedSpells)
    const prepared = spells.filter(spell => storage.preparedSpells?.includes(spell.id) ?? false)
    const MaxLevel = character.maxSpellLevel

    const handleChange = (value: ObjectId) => {
        Communication.getMetadata(value)
        .then((res) => {
            if (res.success && res.result.type === FileType.Spell) {
                let spell: ISpellMetadata = res.result.metadata
                if (spell.level === 0) {
                    setStorage("cantrips", [ ...(storage.cantrips ?? []), value ])
                } else {
                    setStorage("learnedSpells", [ ...(storage.learnedSpells ?? []), value ])
                }
            }
        })
    }

    const handlePrepare = (id: ObjectId) => {
        let spells = storage.preparedSpells ?? []
        setStorage("preparedSpells", [...spells, id])
    }

    const handleRemovePrepared = (id: ObjectId) => {
        let spells = storage.preparedSpells ?? []
        let index = spells.findIndex(spellId => String(spellId) === String(id))
        if (index >= 0) {
            setStorage("preparedSpells", [ ...spells.slice(0, index), ...spells.slice(index + 1) ])
        }
    }

    const handleRemove = (id: ObjectId) => {
        let spells = storage.learnedSpells ?? []
        let index = spells.findIndex(spellId => String(spellId) === String(id))
        if (index >= 0) {
            setStorage("learnedSpells", [ ...spells.slice(0, index), ...spells.slice(index + 1) ])
            if (storage.preparedSpells?.includes(id)) {
                handleRemovePrepared(id)
            }
        }
    }

    const handleRemoveCantrip = (id: ObjectId) => {
        let cantrips = storage.cantrips ?? []
        let index = cantrips.findIndex(spellId => String(spellId) === String(id))
        if (index >= 0) {
            setStorage("cantrips", [ ...cantrips.slice(0, index), ...cantrips.slice(index + 1) ])
        }
    }

    return (
        <>
            { !character.learnedAll &&
                <CollapsibleGroup header={`Known Spells (${spells.length}/${character.learnedSlots})`}>
                    <div className={styles.spellFilterMenu}>
                        <label>Filter: </label>
                        { Array.from({ length: MaxLevel }).map((_, index) => (
                            <button 
                                key={index}
                                className={styles.spellFilterMenuItem}
                                tooltips={`Toggle`}>
                                {index + 1}
                            </button>
                        ))}
                    </div>
                    { spells.map((data) => {
                        let spell = new SpellData(data.metadata)
                        let error = spell.level > MaxLevel
                        return (
                            <div key={String(data.id)} className={styles.spellItem} error={String(error)}>
                                <b>{spell.name}: </b>
                                <label>{spell.levelText}</label>
                                <label>{spell.schoolName}</label>
                                <button tooltips="Prepare" onClick={() => handlePrepare(data.id)}>
                                    <PrepareIcon/>
                                </button>
                                <button tooltips="Remove" onClick={() => handleRemove(data.id)}>
                                    <RemoveIcon/>
                                </button>
                            </div>
                        )
                    })}
                </CollapsibleGroup>
            }{ !character.learnedAll &&
                <CollapsibleGroup header={`Cantrips (${cantrips.length}/${character.cantripSlots})`}>
                    { cantrips.map((data) => {
                        let spell = new SpellData(data.metadata)
                        return (
                            <div key={String(data.id)} className={styles.spellItem}>
                                <b>{spell.name}: </b>
                                <label>{spell.levelText}</label>
                                <label>{spell.schoolName}</label>
                                <button tooltips="Remove" onClick={() => handleRemoveCantrip(data.id)}>
                                    <RemoveIcon/>
                                </button>
                            </div>
                        )
                    })}
                </CollapsibleGroup>
            }{ !character.preparationAll &&
                <CollapsibleGroup header={`Prepared Spells (${prepared.length ?? 0}/${character.preparationSlots})`}>
                    <div className={styles.spellFilterMenu}>
                        <label>Filter: </label>
                        { Array.from({ length: MaxLevel }).map((_, index) => (
                            <button 
                                key={index}
                                className={styles.spellFilterMenuItem}
                                tooltips={`Toggle`}>
                                {index + 1}
                            </button>
                        ))}
                    </div>
                    { prepared.map((data) => {
                        let spell = new SpellData(data.metadata)
                        let error = spells.every(x => x.id !== data.id)
                        return (
                            <div key={String(data.id)} className={styles.spellItem} error={String(error)}>
                                <b>{spell.name}: </b>
                                <label>{spell.levelText}</label>
                                <label>{spell.schoolName}</label>
                                <button tooltips="Remove" onClick={() => handleRemovePrepared(data.id)}>
                                    <RemoveIcon/>
                                </button>
                            </div>
                        )
                    })}
                </CollapsibleGroup>
            }
            <CollapsibleGroup header="Add Spell">
                <div className={styles.modifierChoice}>
                    <Elements.Bold>Spell: </Elements.Bold>
                    <LinkInput
                        value={null}
                        fileTypes={[FileType.Spell]}
                        placeholder="Spell ID..."
                        allowRemove={false}
                        onChange={handleChange}/>
                </div>
            </CollapsibleGroup>
        </>
    )
}

const reduceEnumOptions = (value: EnumChoiceData) => (
    value.options.reduce((prev, option) => (
        { ...prev, [option]: getOptionType(value.enum).options[option] }
    ), { null: "Unset" })
)

const reduceChoiceOptions = (value: ChoiceChoiceData) => (
    value.options.reduce((prev, option) => (
        { ...prev, [option.id]: option.label }
    ), { null: "Unset" })
)

const CharacterClassPage = ({ character, classData, setStorage }: CharacterClassPageProps): JSX.Element => {
    const choices = useMemo(() => character.modifiers.getChoices(), [character])
    const storage = classData.storage?.classData ?? {}
    
    const handleChange = (value: any, key: string) => {
        let validStorage = Object.keys(storage).reduce((prev, key) => (
            Object.keys(choices).includes(key) || key === "$subclass" ? { ...prev, [key]: storage[key] } : prev
        ), {})
        setStorage("classData", { ...validStorage, [key]: value });
    }

    return (
        <>
            { character.level >= classData.subclassLevel &&
                <div className={styles.modifierChoice}>
                    <Elements.Bold>{`Subclass:`} </Elements.Bold>
                    <LinkDropdownMenu
                        value={storage.$subclass ?? null}
                        itemClassName={styles.dropdownItem}
                        values={classData.subclasses}
                        allowNull={true}
                        onChange={(value) => handleChange(value, "$subclass")}/>
                </div>
            }{ Object.keys(choices).map(key => {
                let value = choices[key]
                return (
                    <div className={styles.modifierChoice} key={key}>
                        <Elements.Bold>{`${value.label}:`} </Elements.Bold>
                        { value.type === "choice" &&
                            <DropdownMenu
                                value={storage[key] ?? null}
                                itemClassName={styles.dropdownItem}
                                values={reduceChoiceOptions(value)}
                                onChange={(value) => handleChange(value, key)}/>
                        }
                        { value.type === "enum" &&
                            <DropdownMenu
                                value={storage[key] ?? null}
                                itemClassName={styles.dropdownItem}
                                values={reduceEnumOptions(value)}
                                onChange={(value) => handleChange(value, key)}/>
                        }
                        { value.type === "file" && value.allowAny === false &&
                            <LinkDropdownMenu
                                value={storage[key] ?? null}
                                itemClassName={styles.dropdownItem}
                                values={value.options}
                                allowNull={true}
                                onChange={(value) => handleChange(value, key)}/>
                        }
                        { value.type === "file" && value.allowAny &&
                            <LinkInput
                                value={storage[key] ?? null}
                                fileTypes={value.options}
                                placeholder="File ID..."
                                onChange={(value) => handleChange(value, key)}/>
                        }
                    </div>
                )
            })}
        </>
    )
}

const CharacterLinkRenderer = ({ file }: CharacterLinkRendererProps): JSX.Element => {
    const description = useParser(file.metadata?.description, file.metadata, `$${file.id}.description`)
    return (
        <Elements.Align>
            <Elements.Image options={{ width: '120px', href: file.metadata?.portrait }}/>
            <Elements.Line/>
            <Elements.Block>
                <Elements.Header3>
                    { file.metadata?.name }
                </Elements.Header3>
                { description }
            </Elements.Block>
        </Elements.Align>
    )
}

const CharacterRenderer: RendererObject<CharacterFile> = {
    fileRenderer: CharacterFileRenderer,
    linkRenderer: CharacterLinkRenderer
}

export default CharacterRenderer;