import { AdvantageIcon, DisadvantageIcon } from 'assets/icons';
import Elements from 'data/elements';
import CreatureData from 'data/structures/creature';
import { getOptionType } from 'data/optionData';
import { SkillAdvantageBindingMap } from 'utils/calculations';
import Localization from 'utils/localization';
import { Skill } from 'types/database/dnd';
import styles from 'styles/renderer.module.scss';

type DataProps = React.PropsWithRef<{
    data: CreatureData 
}>

const ProficienciesPage = ({ data }: DataProps): JSX.Element => {
    const skills = getOptionType("skill").options
    const attributes = getOptionType("attr").options;
    const advantages = data.advantages
    const disadvantages = data.disadvantages
    return (
        <>
            <div className={styles.skillTable}>
                <div>
                    <b>Mod</b>
                    <span/>
                    <b>Skill</b>
                    <span/>
                    <b>Bonus</b>
                </div>
                { Object.keys(skills).map((skill: Skill) => {
                    return (
                        <div key={skill}>
                            <b>{attributes[data.getSkillAttribute(skill)]}</b>
                            <div
                                className={styles.proficiencyMarker}
                                data={data.proficienciesSkill[skill] ?? "none"}
                                tooltips={getOptionType("proficiencyLevel").options[data.proficienciesSkill[skill]]}/>
                            <label>{skills[skill]}</label>
                            <div className={styles.iconHolder}>
                                { SkillAdvantageBindingMap[skill] in advantages &&
                                    <span tooltips={advantages[SkillAdvantageBindingMap[skill]]}>
                                        <AdvantageIcon/>
                                    </span>
                                }
                                { SkillAdvantageBindingMap[skill] in disadvantages &&
                                    <span tooltips={disadvantages[SkillAdvantageBindingMap[skill]]}>
                                        <DisadvantageIcon/>
                                    </span>
                                }
                            </div>
                            <Elements.Roll options={{
                                mod: data.getSkillModifier(skill).toString(),
                                desc: `${skills[skill]} Check`,
                                tooltips: `Roll ${skills[skill]} Check`
                            }}/>
                        </div>
                    )
                })}
            </div>
            <Elements.Header3>Armor</Elements.Header3>
            <div>{data.proficienciesArmorText}</div>
            <Elements.Header3>Weapons</Elements.Header3>
            <div>{data.proficienciesWeaponText}</div>
            <Elements.Header3>Languages</Elements.Header3>
            <div>{data.proficienciesLanguageText}</div>
            <Elements.Header3>Tools</Elements.Header3>
            <div>{data.proficienciesToolText}</div>
        </>
    )
}

export default ProficienciesPage;