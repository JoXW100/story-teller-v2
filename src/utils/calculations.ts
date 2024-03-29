import SpellData from 'data/structures/spell';
import { asEnum, asNumber } from './helpers';
import ICreatureStats from 'types/database/files/iCreatureStats';
import { ISpellMetadata } from 'types/database/files/spell';
import { AdvantageBinding, AreaType, Attribute, OptionalAttribute, ProficiencyLevel, ScalingType, Skill, TargetType } from "types/database/dnd";

export const getAttributeModifier = (stats: ICreatureStats = {}, attr: Attribute): number => {
    return Math.ceil((asNumber(stats?.[attr], 10) - 11) / 2.0)
}

export const getScalingValue = (scaling: ScalingType | Attribute | OptionalAttribute, stats: ICreatureStats): number => {
    switch (scaling) {
        case ScalingType.Finesse:
            return Math.max(getScalingValue(ScalingType.DEX, stats), getScalingValue(ScalingType.STR, stats));
        case ScalingType.SpellModifier:
            return getScalingValue(stats.spellAttribute, stats)
        case ScalingType.None:
            return 0;
        default:
            let attribute = asEnum(scaling, Attribute);
            return attribute ? getAttributeModifier(stats, attribute) : 0
    }
}

export const getSpellRange = (spell: ISpellMetadata): string => {
    let area = null;
    switch (spell.area) {
        case AreaType.Cone:
        case AreaType.Cube:
        case AreaType.Square:
        case AreaType.Sphere:
        case AreaType.Line:
            area = `${spell.areaSize ?? 0}ft`;
            break;
        case AreaType.Cylinder:
            area = `${spell.areaSize ?? 0}x${spell.areaHeight ?? 0}ft`;
            break;
        default:
            break;
    }
    switch (spell.target) {
        case TargetType.Self:
            return area ? `Self/${area}` : "Self"
        case TargetType.Point:
            return area ? `${spell.range ?? 0}ft/${area}` : `${spell.range ?? 0}ft`
        case TargetType.Touch:
            return 'Touch'
        default:
        case TargetType.Single:
        case TargetType.Multiple:
            return `${spell.range ?? 0}ft`
    }
}

export const getComponents = (spell: SpellData): string[] => {
    let components: string[] = []
    if (spell.componentVerbal)
        components.push('V')
    if (spell.componentSomatic)
        components.push('S')
    if (spell.componentMaterial)
        components.push('M')
    return components
}

const ProficiencyLevelValueMap: Record<ProficiencyLevel, number> = {
    [ProficiencyLevel.HalfProficient]: 0.5,
    [ProficiencyLevel.Proficient]: 1,
    [ProficiencyLevel.Expert]: 2
}

export const getProficiencyLevelValue = (proficiency: ProficiencyLevel): number => {
    return ProficiencyLevelValueMap[proficiency] ?? 0
}

export const getMaxProficiencyLevel = (...proficiencies: ProficiencyLevel[]): ProficiencyLevel => {
    let max_value: number = 0
    let max_proficiency: ProficiencyLevel = null
    for (let proficiency of proficiencies) {
        if (proficiency === ProficiencyLevel.Expert) {
            return proficiency
        }
        if (proficiency && ProficiencyLevelValueMap[proficiency] > max_value) {
            max_value = ProficiencyLevelValueMap[proficiency]
            max_proficiency = proficiency
        }
    }
    return max_proficiency
}

export const SkillAdvantageBindingMap: Record<Skill, AdvantageBinding> = {
    [Skill.Acrobatics]: AdvantageBinding.AcrobaticsCheck,
    [Skill.AnimalHandling]: AdvantageBinding.AnimalHandlingCheck,
    [Skill.Arcana]: AdvantageBinding.ArcanaCheck,
    [Skill.Athletics]: AdvantageBinding.AthleticsCheck,
    [Skill.Deception]: AdvantageBinding.DeceptionCheck,
    [Skill.History]: AdvantageBinding.HistoryCheck,
    [Skill.Insight]: AdvantageBinding.InsightCheck,
    [Skill.Intimidation]: AdvantageBinding.IntimidationCheck,
    [Skill.Investigation]: AdvantageBinding.InvestigationCheck,
    [Skill.Medicine]: AdvantageBinding.MedicineCheck,
    [Skill.Nature]: AdvantageBinding.NatureCheck,
    [Skill.Perception]: AdvantageBinding.PerceptionCheck,
    [Skill.Performance]: AdvantageBinding.PerformanceCheck,
    [Skill.Persuasion]: AdvantageBinding.PersuasionCheck,
    [Skill.Religion]: AdvantageBinding.ReligionCheck,
    [Skill.SleightOfHand]: AdvantageBinding.SleightOfHandCheck,
    [Skill.Stealth]: AdvantageBinding.StealthCheck,
    [Skill.Survival]: AdvantageBinding.SurvivalCheck
}

export const AttributeAdvantageBindingMap: Record<Attribute, AdvantageBinding> = {
    [Attribute.STR]: AdvantageBinding.StrengthSave,
    [Attribute.DEX]: AdvantageBinding.DexteritySave,
    [Attribute.CON]: AdvantageBinding.ConstitutionSave,
    [Attribute.INT]: AdvantageBinding.IntelligenceSave,
    [Attribute.WIS]: AdvantageBinding.WisdomSave,
    [Attribute.CHA]: AdvantageBinding.CharismaSave
}