import Elements from 'data/elements';
import Localization from 'utils/localization';
import CreatureData from 'data/structures/creature';
import { getOptionType } from 'data/optionData';
import { Skill } from 'types/database/dnd';
import styles from 'styles/renderer.module.scss';

type DataProps = React.PropsWithRef<{
    data: CreatureData 
}>

const ProficienciesPage = ({ data }: DataProps): JSX.Element => {
    const skills = getOptionType("skill").options
    const attributes = getOptionType("attr").options;
    return (
        <>
            <div className={styles.skillTable}>
                <div>
                    <b>Mod</b>
                    <br/>
                    <b>Skill</b>
                    <b>Bonus</b>
                </div>
                { Object.keys(skills).map((skill: Skill) => {
                    return (
                        <div key={skill}>
                            <b>{attributes[data.getSkillAttribute(skill)]}</b>
                            <div 
                                data={data.proficienciesSkill[skill] ?? "none"}
                                tooltips={Localization.toText('creature-Proficient')}/>
                            <label>{skills[skill]}</label>
                            <Elements.Roll options={{
                                mod: data.getSkillModifier(skill).toString(),
                                desc: `${skills[skill]} Check`,
                                tooltips: `Roll ${skills[skill]} Check`
                            }}/>
                        </div>
                    )
                })}
            </div>
            <Elements.Line/>
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