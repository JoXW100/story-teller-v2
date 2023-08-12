import React, { useContext, useMemo, useState } from 'react';
import DropdownMenu from 'components/common/controls/dropdownMenu';
import LinkDropdownMenu from 'components/common/controls/linkDropdownMenu';
import LinkInput from 'components/common/controls/linkInput';
import { Context } from 'components/contexts/fileContext';
import { useParser } from 'utils/parser';
import Localization from 'utils/localization';
import { useFile } from 'utils/handlers/files';
import { AbilityGroups } from './ability';
import { SpellGroups } from './spell';
import { CharacterProficienciesPage } from './creature';
import Elements from 'data/elements';
import RollElement from 'data/elements/roll';
import CharacterData from 'data/structures/character';
import AbilityData from 'data/structures/ability';
import ModifierCollectionData from 'data/structures/modifierCollection';
import ClassData from 'data/structures/classData';
import { getOptionType } from 'data/optionData';
import CharacterFile, { ICharacterMetadata } from 'types/database/files/character';
import { FileGetManyMetadataResult, FileGetMetadataResult, FileMetadataQueryResult } from 'types/database/responses';
import { IClassMetadata } from 'types/database/files/class';
import { Attribute, OptionalAttribute } from 'types/database/dnd';
import { RendererObject } from 'types/database/editor';
import { EnumChoiceData, IModifierCollection } from 'types/database/files/modifierCollection';
import { IAbilityMetadata } from 'types/database/files/ability';
import styles from 'styles/renderer.module.scss';

type CharacterFileRendererProps = React.PropsWithRef<{
    file: CharacterFile
    classFile?: FileGetMetadataResult<IClassMetadata>
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
}>

const Pages = ["Background", "Proficiencies", "Class"] as const

const CharacterFileRenderer = (props: CharacterFileRendererProps): JSX.Element => {
    const [file] = useFile<IClassMetadata>(props.file?.metadata?.classFile)
    const Renderer = props.file?.metadata?.simple ?? false
        ? SimpleCharacterRenderer
        : DetailedCharacterRenderer

    return <Renderer {...props} classFile={file}/>
}

const SimpleCharacterRenderer = ({ file, classFile }: CharacterFileRendererProps): JSX.Element => {
    const classData = new ClassData(classFile?.metadata, file?.storage, classFile?.id ? String(classFile?.id) : undefined);
    const character = new CharacterData(file.metadata, null, classData)
    const content = useParser(file.content.text, file.metadata, "$content");
    const appearance = useParser(character.appearance, file.metadata, "appearance")
    const description = useParser(character.description, file.metadata, "description")
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

const DetailedCharacterRenderer = ({ file, classFile }: CharacterFileRendererProps): JSX.Element => {
    const [modifiers, setModifiers] = useState<IModifierCollection>(null)
    const [page, setPage] = useState<typeof Pages[number]>(Pages[0])
    const classData = new ClassData(classFile?.metadata, file?.storage, classFile?.id ? String(classFile?.id) : undefined);
    const character = new CharacterData(file.metadata, modifiers, classData)
    const content = useParser(file.content.text, file.metadata, "$content");
    const appearance = useParser(character.appearance, file.metadata, "appearance")
    const description = useParser(character.description, file.metadata, "description")
    const history = useParser(character.history, file.metadata, "history")
    const notes = useParser(character.notes, file.metadata, "notes")
    const stats = character.getStats()

    const abilities = useMemo(() => character.abilities, [file.metadata, file?.storage, classFile])

    const handleAbilitiesLoaded = (abilities: FileGetManyMetadataResult<IAbilityMetadata>) => {
        let modifiers = abilities.flatMap((ability) => new AbilityData(ability.metadata, null, String(ability.id)).modifiers);
        let collection = new ModifierCollectionData(modifiers, file?.storage)
        setModifiers(collection);
    }

    return (
        <>
            <Elements.Align>
                <Elements.Block>
                    <Elements.Header1> {character.name} </Elements.Header1>
                    <Elements.Line/>
                    <div className={styles.pageSelector}>
                        { Object.values(Pages).map((p, index) => (
                            <button key={index} disabled={page === p} onClick={() => setPage(p)}>
                                { p }
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
                        <CharacterProficienciesPage data={character}/>
                    </div>
                    <div className={styles.pageItem} data={page === "Class" ? "show" : "hide"}>
                        <CharacterClassPage character={character} classData={classData}/>
                    </div>
                </Elements.Block>
                <Elements.Line/>
                <Elements.Block>
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
                    <Elements.Line/>
                    <Elements.Align>
                        { Object.keys(Attribute).map((attr, index) => (
                            <div className={styles.attributeBox} key={index}>
                                <Elements.Bold>{attr}</Elements.Bold>
                                <Elements.Bold>{character[Attribute[attr]] ?? 0}</Elements.Bold>
                                <Elements.Roll options={{ 
                                    mod: character.getAttributeModifier(Attribute[attr]).toString(), 
                                    desc: `${attr} Check`,
                                    tooltips: `${attr} Check`
                                }}/>
                                <div/>
                                <Elements.Roll options={{ 
                                    mod: character.getSaveModifier(Attribute[attr]).toString(), 
                                    desc: `${attr} Save`,
                                    tooltips: `${attr} Save`
                                }}/>
                            </div>
                        ))}
                    </Elements.Align>
                    <Elements.Line/>
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
                        onLoaded={handleAbilitiesLoaded}/>
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
                        spellIds={character.spells} 
                        spellSlots={character.spellSlots} 
                        data={stats}/>
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
            {`${character.sizeText} ${character.typeText}, ${character.alignmentText}`}
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
                <Elements.Text>{appearance}</Elements.Text>
            </> : null }
            { character.description.length > 0 ? <>
                <Elements.Line/>
                <Elements.Header3>Description</Elements.Header3>
                <Elements.Text>{description}</Elements.Text>
            </> : null }
            { character.history.length > 0 ? <>
                <Elements.Line/>
                <Elements.Header3>History</Elements.Header3>
                <Elements.Text>{history}</Elements.Text>
            </> : null }
            { character.notes.length > 0 ? <>
                <Elements.Line/>
                <Elements.Header3>Notes</Elements.Header3>
                <Elements.Text>{notes}</Elements.Text>
            </> : null }
        </>
    )
}

const CharacterClassPage = ({ character, classData }: CharacterClassPageProps): JSX.Element => {
    const [_, dispatch] = useContext(Context)
    const choices = character.modifiers.getChoices()
    const storage = { ...(classData.storage?.classData ?? {}) }

    const handleChange = (value: any, key: string) => {
        dispatch.setStorage("classData", { ...storage, [key]: value });
    }

    const reduceEnumOptions = (value: EnumChoiceData) => (
        value.options.reduce((prev, option) => (
            { ...prev, [option]: getOptionType(value.enum).options[option] }
        ), { null: "Unset" })
    )

    return (
        <>
            { Object.keys(choices).map(key => {
                let value = choices[key]
                return (
                    <div className={styles.modifierChoice} key={key}>
                        <Elements.Bold>{`${value.label}:`} </Elements.Bold>
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
                                onChange={(value) => handleChange(value, key)}/>
                        }
                        { value.type === "file" && value.allowAny &&
                            <LinkInput
                                value={storage[key] ?? null}
                                fileTypes={value.options}
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