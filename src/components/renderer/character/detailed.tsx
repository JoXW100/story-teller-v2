import { useContext, useMemo, useState } from 'react';
import { Context } from 'components/contexts/fileContext';
import { useParser } from 'utils/parser';
import Localization from 'utils/localization';
import { useFile, useFiles } from 'utils/handlers/files';
import CharacterBackgroundPage from './backgroundPage';
import CharacterSpellPage from './spellPage';
import CharacterClassPage from './classPage';
import ItemsPage from './itemsPage';
import AbilityGroups from '../ability/abilityGroup';
import SpellGroups from '../spell/spellGroups';
import AttributesBox from '../creature/attributesBox';
import ProficienciesPage from '../creature/proficienciesPage';
import PageSelector from '../pageSelector';
import Elements from 'data/elements';
import RollElement from 'data/elements/roll';
import CharacterData from 'data/structures/character';
import AbilityData from 'data/structures/ability';
import ModifierCollection from 'data/structures/modifierCollection';
import ClassData from 'data/structures/class';
import Logger from 'utils/logger';
import CharacterFile, { ICharacterAbilityStorageData } from 'types/database/files/character';
import { FileGetManyMetadataResult } from 'types/database/responses';
import { IClassMetadata } from 'types/database/files/class';
import { OptionalAttribute } from 'types/database/dnd';
import { IModifierCollection } from 'types/database/files/modifierCollection';
import { IAbilityMetadata } from 'types/database/files/ability';
import styles from 'styles/renderer.module.scss';
import { IItemMetadata } from 'types/database/files/item';
import ItemCollection from 'data/structures/itemCollection';

type CharacterFileRendererProps = React.PropsWithRef<{
    file: CharacterFile
}>

const DetailedCharacterRenderer = ({ file }: CharacterFileRendererProps): JSX.Element => {
    const [_, dispatch] = useContext(Context)
    const [modifiers, setModifiers] = useState<IModifierCollection>(null)
    const [page, setPage] = useState<typeof Pages[number]>("Background")
    const [classFile] = useFile<IClassMetadata>(file.metadata?.classFile)
    const [subclassFile] = useFile<IClassMetadata>(file.storage?.classData?.$subclass);
    const [items] = useFiles<IItemMetadata>(file.storage?.inventory);

    const itemsData = useMemo(() => new ItemCollection(items.map(item => item.metadata), file.storage), [items, file.storage])
    const classData = useMemo(() => new ClassData(classFile?.metadata, file.storage, classFile?.id ? String(classFile?.id) : undefined), [classFile, file.storage])
    const subclassData = useMemo(() => new ClassData(classData.subclasses.includes(subclassFile?.id) ? subclassFile?.metadata : null, file.storage, subclassFile?.id ? String(subclassFile?.id) : undefined), [subclassFile, classData])
    const character =  useMemo(() => new CharacterData(file.metadata, file.storage, itemsData, modifiers, classData, subclassData), [file.metadata, file.storage, itemsData, modifiers, classData, subclassData])
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
        "Items",
        character.spellAttribute !== OptionalAttribute.None && character.classFile ? "Spells" : null, 
        character.classFile ? "Class" : null]

    const expendedAbilityCharges = Object.keys(file.storage?.abilityData ?? {}).reduce<Record<string,number>>((prev, value) => (
        { ...prev, [value]: file.storage.abilityData[value].expendedCharges ?? 0 }
    ), {})
    const expendedSpellSlots = file.storage?.spellData ?? []

    const handleAbilitiesLoaded = (abilities: FileGetManyMetadataResult<IAbilityMetadata>) => {
        let modifiersList = abilities.flatMap((ability) => new AbilityData(ability.metadata, null, String(ability.id)).modifiers);
        let collection = new ModifierCollection(modifiersList, file.storage)
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
                    <PageSelector pages={Pages} page={page} setPage={setPage}/>
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
                    <div className={styles.pageItem} data={page === "Items" ? "show" : "hide"}>
                        <ItemsPage character={character} storage={file.storage} setStorage={dispatch.setStorage}/>
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
                            storage={file.storage}
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
                    }{ character.disadvantages.length > 0 && 
                        <div><Elements.Bold>Disadvantages </Elements.Bold>
                            {character.disadvantages}
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

export default DetailedCharacterRenderer;