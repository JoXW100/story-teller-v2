import { useContext, useEffect, useMemo, useState } from 'react';
import { Context } from 'components/contexts/fileContext';
import { useParser } from 'utils/parser';
import Localization from 'utils/localization';
import CharacterBackgroundPage from './backgroundPage';
import CharacterSpellPage from './spellPage';
import CharacterClassPage from './classPage';
import InventoryPage from './inventoryPage';
import HealthBox from './healthBox';
import AbilityGroups from '../ability/abilityGroup';
import SpellGroups from '../spell/spellGroups';
import AttributesBox from '../creature/attributesBox';
import ProficienciesPage from '../creature/proficienciesPage';
import PageSelector from '../pageSelector';
import ShortRestSidePanel from './shortRestSidePanel';
import { CampIcon, NightIcon } from 'assets/icons';
import Elements from 'data/elements';
import RollElement from 'data/elements/roll';
import Logger from 'utils/logger';
import useCharacterHandler from 'utils/handlers/characterHandler';
import { CharacterFile, ICharacterAbilityStorageData } from 'types/database/files/character';
import { AdvantageBinding, OptionalAttribute, RestType } from 'types/database/dnd';
import { RollType } from 'types/dice';
import styles from 'styles/renderer.module.scss';
import { openPopup } from 'components/common/popupHolder';
import ConfirmationPopup from 'components/common/confirmationPopup';

type CharacterFileRendererProps = React.PropsWithRef<{
    file: CharacterFile
}>

const DetailedCharacterRenderer = ({ file }: CharacterFileRendererProps): JSX.Element => {
    const [context, dispatch] = useContext(Context)
    const [character, abilities, items] = useCharacterHandler(file)
    const [page, setPage] = useState<typeof Pages[number]>("Abilities")
    const spells = useMemo(() => character?.spells, [character])
    const stats = useMemo(() => character?.getStats(), [character])
    const values = useMemo(() => character?.getValues(), [character])

    const content = useParser(file.content.text, character, "$content");
    const appearance = useParser(character?.appearance, character, "appearance")
    const description = useParser(character?.description, character, "description")
    const history = useParser(character?.history, character, "history")
    const notes = useParser(character?.notes, character, "notes")

    const Pages = [
        "Abilities",
        "Inventory",
        "Background", 
        character.spellAttribute !== OptionalAttribute.None && character.classFile ? "Spells" : null, 
        character.classFile ? "Class" : null]

    const expendedAbilityCharges = Object.keys(file.storage?.abilityData ?? {})
    .reduce<Record<string,number>>((prev, value) => (
        { ...prev, [value]: file.storage.abilityData[value].expendedCharges ?? 0 }
    ), {})
    const expendedSpellSlots = file.storage?.spellData ?? []
    const senses = character?.sensesAsText

    const handleSetExpendedAbilityCharges = (value: Record<string, number>) => {
        let data = Object.keys(value).reduce<Record<string, ICharacterAbilityStorageData>>((prev, key) => (
            character.abilities.includes(key)
            ? { ...prev, [key]: { ...file.storage.abilityData?.[key], expendedCharges: value[key] }} 
            : prev
        ), {})
        dispatch.setStorage("abilityData", data)
    }

    const handleShortRest = () => {
        dispatch.openSidePanel({
            header: "Short Rest",
            content: (
                <ShortRestSidePanel 
                    character={character} 
                    storage={file.storage} 
                    abilities={abilities}
                />
            )
        })
    }

    const handleLongRest = () => {
        const optionYes = Localization.toText('character-longRest-confirmationYes');
        const optionNo = Localization.toText('character-longRest-confirmationNo');
        openPopup(
            <ConfirmationPopup 
                header={Localization.toText('character-longRest-confirmationHeader')}
                description={Localization.toText('character-longRest-confirmationDescription')}
                options={[optionYes, optionNo]}
                callback={(option) => {
                    if (option === optionYes) {
                        let data = {...file.storage?.abilityData ?? {}}
                        for (const key in abilities) {
                            const ability = abilities[key]
                            if ((ability.chargesReset === RestType.LongRest || ability.chargesReset === RestType.ShortRest) && data[key]) {
                                data[key].expendedCharges = 0
                            }
                        }
                        dispatch.setStorage("abilityData", data)
                        dispatch.setStorage("health", character.healthValue)
                        dispatch.setStorage("tempHealth", 0)
                        dispatch.setStorage("hitDice", {})
                    }
                }}/>
        )
    }

    const handleSetExpendedSpellSlots = (value: number[]) => {
        dispatch.setStorage("spellData", value)
    }

    useEffect(() => {
        if (context.rendererSidePanel?.header === "Short Rest") {
            handleShortRest()
        }
    }, [character, file.storage, abilities])

    Logger.log("DetailedCharacterRenderer", character)

    return (
        <>
            <Elements.Align>
                <Elements.Block>
                    <div className={styles.namePlate}>
                        <Elements.Image options={{href: character.portrait}}/>
                        <div className={styles.characterDetailsPanel}>
                            <Elements.Header2>{character.name}</Elements.Header2>
                            <div className={styles.noLineBreak}>{`${character.genderText} ${character.raceName} ${character.className}`}</div>
                            <div>{`Level ${character.level}`}</div>
                        </div>
                        <div className={styles.restPanel}>
                            <button onClick={handleShortRest} tooltips={Localization.toText('character-shortRest')}>
                                <CampIcon/>
                            </button>
                            <button onClick={handleLongRest} tooltips={Localization.toText('character-longRest')}>
                                <NightIcon/>
                            </button>
                        </div>
                    </div>
                    <Elements.Line/>
                    <AttributesBox data={character}/>
                    <Elements.Space/>
                    <Elements.Align>
                        <div className={styles.proficiencyBox}>
                            <b>PROF</b>
                            <RollElement options={{ 
                                mod: String(character.proficiencyValue), 
                                desc: "Proficiency Check"
                            }}/>
                        </div>
                        <div className={styles.passivesBox}>
                            <b>Passive Perception: </b>
                            <b>{character.passivePerceptionValue.toString()}</b>
                            <b>Passive Investigation: </b>
                            <b>{character.passiveInvestigationValue.toString()}</b>
                            <b>Passive Insight: </b>
                            <b>{character.passiveInsightValue.toString()}</b>
                        </div>
                        <div className={styles.speedBox}>
                            <Elements.Bold>SPEED</Elements.Bold>
                            <span>{character.speedAsText}</span>
                        </div>
                    </Elements.Align>
                    <Elements.Space/>
                    <ProficienciesPage data={character}/>
                    <Elements.Space/>
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
                    }{ senses.length > 0 &&
                        <div><Elements.Bold>Senses </Elements.Bold>
                            {senses}
                        </div>
                    }
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
                    <div className={styles.pageItem} data={page === "Inventory" ? "show" : "hide"}>
                        <InventoryPage items={items} storage={file.storage} setStorage={dispatch.setStorage}/>
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
                                <Elements.Header2>Spells:</Elements.Header2>
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

export default DetailedCharacterRenderer;