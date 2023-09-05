import { useContext, useMemo, useState } from 'react';
import { Context } from 'components/contexts/fileContext';
import { useParser } from 'utils/parser';
import Localization from 'utils/localization';
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
import Logger from 'utils/logger';
import CharacterFile, { ICharacterAbilityStorageData, ICharacterStorage } from 'types/database/files/character';
import { AdvantageBinding, OptionalAttribute } from 'types/database/dnd';
import { RollType } from 'types/dice';
import styles from 'styles/renderer.module.scss';
import useCharacterHandler from 'utils/handlers/characterHandler';

type CharacterFileRendererProps = React.PropsWithRef<{
    file: CharacterFile
}>

const DetailedCharacterRenderer = ({ file }: CharacterFileRendererProps): JSX.Element => {
    const [_, dispatch] = useContext(Context)
    const [character, abilities, items] = useCharacterHandler(file)
    const [page, setPage] = useState<typeof Pages[number]>("Abilities")
    const spells = useMemo(() => character.spells, [character])
    const stats = useMemo(() => character.getStats(), [character])
    const values = useMemo(() => character.getValues(), [character])
    const senses = character.sensesAsText

    const content = useParser(file.content.text, character, "$content");
    const appearance = useParser(character.appearance, character, "appearance")
    const description = useParser(character.description, character, "description")
    const history = useParser(character.history, character, "history")
    const notes = useParser(character.notes, character, "notes")

    const Pages = [
        "Abilities",
        "Items",
        "Background", 
        character.spellAttribute !== OptionalAttribute.None && character.classFile ? "Spells" : null, 
        character.classFile ? "Class" : null]

    const expendedAbilityCharges = Object.keys(file.storage?.abilityData ?? {}).reduce<Record<string,number>>((prev, value) => (
        { ...prev, [value]: file.storage.abilityData[value].expendedCharges ?? 0 }
    ), {})
    const expendedSpellSlots = file.storage?.spellData ?? []

    const handleSetExpendedAbilityCharges = (value: Record<string, number>) => {
        let data = Object.keys(value).reduce<Record<string,ICharacterAbilityStorageData>>((prev, key) => (
            character.abilities.includes(key)
            ? { ...prev, [key]: { ...file.storage.abilityData?.[key], expendedCharges: value[key] }} 
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
                    <div className={styles.namePlate}>
                        <Elements.Image options={{href: character.portrait}}/>
                        <div>
                            <Elements.Header2>{character.name}</Elements.Header2>
                            <div>{`${character.genderText} ${character.raceText} ${character.className}`}</div>
                            <div>{`Level ${character.level}`}</div>
                        </div>
                    </div>
                    <Elements.Line/>
                    <AttributesBox data={character}/>
                    <Elements.Space/>
                    <Elements.Space/>
                    <div>
                        <b>Proficiency </b>
                        <RollElement options={{ 
                            mod: String(character.proficiencyValue), 
                            desc: "Proficiency Check"
                        }}/>
                    </div>
                    { character.resistances.length > 0 && 
                        <div>
                            <Elements.Bold>Resistances </Elements.Bold>
                            {character.resistances}
                        </div> 
                    }{ character.disadvantages[AdvantageBinding.General]?.length > 0 && 
                        <div><Elements.Bold>Disadvantages </Elements.Bold>
                            {character.disadvantages[AdvantageBinding.General]}
                        </div> 
                    }{ character.advantages[AdvantageBinding.General]?.length > 0 && 
                        <div><Elements.Bold>Advantages </Elements.Bold>
                            {character.advantages[AdvantageBinding.General]}
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
                    { senses.length > 0 &&
                        <div><Elements.Bold>Senses </Elements.Bold>
                            {senses}
                        </div>
                    }
                    <Elements.Space/>
                    <div><Elements.Bold>Passive Perception: </Elements.Bold>{character.passivePerceptionValue.toString()}</div>
                    <div><Elements.Bold>Passive Investigation: </Elements.Bold>{character.passiveInvestigationValue.toString()}</div>
                    <div><Elements.Bold>Passive Insight: </Elements.Bold>{character.passiveInsightValue.toString()}</div>
                    <Elements.Space/>
                    <ProficienciesPage data={character}/>
                </Elements.Block>
                <Elements.Line/>
                <Elements.Block>
                    <HealthBox character={character} storage={file.storage}/>
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
                    <div className={styles.pageItem} data={page === "Abilities" ? "show" : "hide"}>
                        <AbilityGroups 
                            abilities={abilities} 
                            stats={stats}
                            expendedCharges={expendedAbilityCharges}
                            setExpendedCharges={handleSetExpendedAbilityCharges}
                            values={values}/>
                    </div>
                    <div className={styles.pageItem} data={page === "Items" ? "show" : "hide"}>
                        <ItemsPage items={items} storage={file.storage} setStorage={dispatch.setStorage}/>
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
                            storage={file.storage}
                            setStorage={dispatch.setStorage}/>
                    </div>
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
                                    type: RollType.Attack,
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

type HealthBoxProps = React.PropsWithRef<{
    character: CharacterData
    storage: ICharacterStorage
}>

interface HealthBoxState {
    healDamageInput: string
    hpInput: string
    tempInput: string
}

const HealthBox = ({ character, storage }: HealthBoxProps): JSX.Element => {
    const [context, dispatch] = useContext(Context)
    const [state, setState] = useState<HealthBoxState>({
        healDamageInput: "",
        hpInput: null,
        tempInput: null
    }) 

    const handleChangeHealthInput: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        setState({ ...state, healDamageInput: e.target.value })
    }

    const changeHealth = (value: number) => {
        let max = character.healthValue
        let health = storage.health ?? 0
        let temp = storage.tempHealth ?? 0
        if (value < 0) {
            if (-value > temp) {
                let rest = value + temp
                dispatch.setStorage("health", Math.max(health + rest, 0))
            }
            dispatch.setStorage("tempHealth", Math.max(temp + value, 0))
        } else {
            dispatch.setStorage("health", Math.min(health + value, max))
        }
    }

    const handleHealClick = () => {
        let value = parseInt(state.healDamageInput)
        if (!isNaN(value)) {
            changeHealth(value)
        }
        setState({ ...state, healDamageInput: "" })
    }

    const handleDamageClick = () => {
        let value = parseInt(state.healDamageInput)
        if (!isNaN(value)) {
            changeHealth(-value)
        }
        setState({ ...state, healDamageInput: "" })
    }

    const handleHPClick = () =>{
        setState({ ...state, hpInput: String(storage.health ?? character.healthValue)})
    }

    const handleHPChanged: React.ChangeEventHandler<HTMLInputElement> = (e) =>{
        setState({ ...state, hpInput: e.target.value })
    }

    const handleHPFocusLost: React.FocusEventHandler<HTMLInputElement> = (e) =>{
        let number = parseInt(e.target.value)
        if (!isNaN(number)) {
            dispatch.setStorage("health", Math.min(Math.max(number, 0), character.healthValue))
        }
        setState({ ...state, hpInput: null })
    }

    const handleTempClick = () =>{
        setState({ ...state, tempInput: String(storage.tempHealth ?? 0)})
    }

    const handleTempChanged: React.ChangeEventHandler<HTMLInputElement> = (e) =>{
        setState({ ...state, tempInput: e.target.value })
    }

    const handleTempFocusLost: React.FocusEventHandler<HTMLInputElement> = (e) =>{
        let number = parseInt(e.target.value)
        if (!isNaN(number)) {
            dispatch.setStorage("tempHealth", Math.max(number, 0))
        }
        setState({ ...state, tempInput: null })
    }

    return (
        <Elements.Align>
            <div className={styles.armorBox}>
                <b>AC</b>
                <b>{character.acValue}</b>
            </div>
            <div className={styles.initiativeBox}>
                <b>Initiative</b>
                <Elements.Roll options={{ 
                    mod: character.initiativeValue.toString(), 
                    desc: "Initiative",
                    type: RollType.Initiative,
                    tooltips: "Roll Initiative"
                }}/>
            </div>
            <div className={styles.healthBox}>
                <div>
                    <button 
                        disabled={state.healDamageInput.length == 0} 
                        onClick={handleHealClick}>
                        Heal
                    </button>
                    <input 
                        value={state.healDamageInput} 
                        type='number' 
                        onChange={handleChangeHealthInput}/>
                    <button 
                        disabled={state.healDamageInput.length == 0} 
                        onClick={handleDamageClick}>
                        Damage
                    </button>
                </div>
                <div>
                    <b>HP</b>
                    <span/>
                    <b>MAX</b>
                    <b>TEMP</b>
                    
                    { state.hpInput === null 
                        ? <span onClick={handleHPClick}>{storage.health ?? character.healthValue}</span>
                        : <input type='number' autoFocus onChange={handleHPChanged} onBlur={handleHPFocusLost} value={state.hpInput}/>
                    }
                    <b>/</b>
                    <span>{`${character.healthValue} `}</span>
                    { state.tempInput === null 
                        ? <span onClick={handleTempClick}>{(storage.tempHealth ?? 0) <= 0 ? '-' : storage.tempHealth}</span>
                        : <input type='number' autoFocus onChange={handleTempChanged} onBlur={handleTempFocusLost} value={state.tempInput}/>
                    }

                    <b>Hit Points</b>
                </div>
            </div>
        </Elements.Align>
    )
}

export default DetailedCharacterRenderer;